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
