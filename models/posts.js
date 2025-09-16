const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  user: { type: String, required: true },          // User name or ID
  image: { type: String },                          // URL or path to image
  description: { type: String },                    // Description of the post
  title: { type: String, required: true },         // Title of the post
  date: { type: Date, default: Date.now },         // Start date
  endDate: { type: Date },                          // End date
  teamSize: { type: Number, min: 1 },               // Size of the team
  skills: [{ type: String }]                        // Array of skills
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
