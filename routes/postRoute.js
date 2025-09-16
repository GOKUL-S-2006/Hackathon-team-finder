const express = require("express");
const router = express.Router();
const {
  createPost,
  interestedInPost,
  deletePost,
  updatePost,
  getmypost,
  getallpost,
} = require("../controllers/postController");
const protect=require("./../Middleware/protect")


router.get('/getmypost',protect,getmypost);

router.get("/getallpost",protect,getallpost);

// Route to create a new hackathon post
router.post("/create",protect,createPost);
// Route to express interest in a post
router.post("/interested",protect,interestedInPost);

router.put("/updatepost/:id",protect,updatePost);

router.delete("/delpost/:id",protect,deletePost);

module.exports = router;
