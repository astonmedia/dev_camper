const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
// Route Files
const bootcampRoutes = require("./routes/bootcampRoutes");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
// Load env vars
dotenv.config({ path: "./config/config.env" });
// Create express instance
const app = express();
// Body Parser
app.use(express.json());
// Set up cookie parser
app.use(cookieParser());
// Set up static folder
app.use(express.static(path.join(__dirname, "public")));
// Set PORT Variable
const PORT = process.env.PORT || 5000;
// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

// File uploading
app.use(fileupload());
// Sanitize data
app.use(mongoSanitize());
// Mount Routers to URLS
app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
// Custom error handler
app.use(errorHandler);
// Connect to DB then start server
const server = async () => {
  try {
    // Connection to the database
    await connectDB();
    app.listen(
      PORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port :${PORT}`.yellow
          .bold
      )
    );
    // Once connected start the server
  } catch (err) {
    console.log(`Error: ${err.message}`.red);
    process.exit(1);
  }
};
// Start the application
server();
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  process.exit(1);
});
