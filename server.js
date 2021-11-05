const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
// Route Files
const bootcampRoutes = require("./routes/bootcampRoutes");

// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

// Mount Routers to URLS
app.use("/api/v1/bootcamps", bootcampRoutes);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port :${PORT}`)
);
