const Post = require('../models/post');
const User = require('../models/user'); 
const nodemailer = require('nodemailer');

// Controller to create a new hackathon post
exports.createPost = async (req, res) => {
  try {
    const { user, image, description, title, date, endDate, teamSize, skills } = req.body;

    const newPost = new Post({
      user,         // This should be the user's ObjectId
      image,
      description,
      title,
      date,
      endDate,
      teamSize,
      skills
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

exports.interestedInPost = async (req, res) => {
  try {
    const { postId, interestedUserId } = req.body;

    // Populate user field when fetching the post
    const post = await Post.findById(postId).populate('user');  
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const interestedUser = await User.findById(interestedUserId);
    if (!interestedUser) return res.status(404).json({ message: 'Interested User not found' });

    const postCreator = post.user;  // Now we already have the full User object thanks to populate
    if (!postCreator) return res.status(404).json({ message: 'Post creator not found' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: postCreator.email,  // Correct email
      subject: 'Someone is interested in your hackathon post',
      html: `
        <p><strong>${interestedUser.name}</strong> is interested in your hackathon post titled: "<em>${post.title}</em>".</p>
        <p>Contact details:</p>
        <ul>
          <li>Email: ${interestedUser.email}</li>
          <li>User ID: ${interestedUser._id}</li>
        </ul>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send email', error });
      }
      console.log('📧 Sending email to:', postCreator.email);

      res.json({ message: 'Notification sent to post creator' });
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if logged-in user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updateData = req.body;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if logged-in user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};


exports.getmypost = async (req, res) => {
  try {
       const myPosts = await Post.find({ user: req.user._id });

    res.status(200).json({
      message: "Posts fetched successfully",
      count: myPosts.length,
      posts: myPosts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

exports.getallpost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      message: "All posts fetched successfully",
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};
