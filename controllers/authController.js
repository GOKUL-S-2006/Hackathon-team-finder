const User=require('../models/user');
const crypto = require("crypto");
const jwt=require('jsonwebtoken');
const sendEmail=require('./../utils/sendEmail');
//Generate JWT Token
const generateToken=(id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
 
  try {
    const { name, email, password } = req.body;
       console.log("Signup request body:", req.body)
    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user
    if (req.body.password !== req.body.passwordConfirm) {
  return res.status(400).json({ message: "Passwords do not match" });
}

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser=async (req,res)=>{
    try{
          const {email,password}=req.body;
          const user=await User.findOne({email}).select("+password");//.select("+password") temporarily includes the password field, which is normally hidden, so you can check it during login.
              if (!user) {
           return res.status(400).json({ message: "Invalid credentials" });
                    }    

        const isMatch = await user.matchPassword(password);//custom method you defined in UserSchema
           if (!isMatch) {
                  return res.status(400).json({ message: "Invalid credentials" });
              }


               res.json({
                   _id: user._id,
                   name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                  })


    }catch(err){
             console.error("Login error:", err);
              res.status(500).json({ message: "Server error" });
    }
}
