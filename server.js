const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoute"); // Add your post routes

app.use(cors());
app.use(express.json());

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Mount post-related routes
app.use("/api/posts", postRoutes);
app.use((req, res, next) => {
  console.log(`➡️  Incoming request: ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 8000;

// Connect to DB, then start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
