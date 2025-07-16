const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

//logger morgan
var logger = require("morgan");

//moment
const moment = require("moment");

//config
const config = require("./config");

//SQLite database connection
const { openDatabase } = require("./server/database/sqlite");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

//routes
const Route = require("./route");
app.use("/api", Route);

//Image Path - Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

//default route
app.get("/", function (req, res) {
  res.status(200).json({
    status: true,
    message: "GICPhotoAI Backend API is running with SQLite!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

//health check endpoint
app.get("/health", async (req, res) => {
  try {
    const db = await openDatabase();
    const dbCheck = await db.get("SELECT 1 as ok");
    
    res.status(200).json({
      status: "healthy",
      database: dbCheck ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

//404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "API endpoint not found",
    path: req.originalUrl
  });
});

//global error handler
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);
  res.status(500).json({
    status: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
  });
});

//initialize database and start server
async function startServer() {
  try {
    // Initialize SQLite database
    await openDatabase();
    console.log("SQLite database initialized successfully");
    
    // Start server
    app.listen(config.PORT, () => {
      console.log(`GICPhotoAI Backend Server running on http://localhost:${config.PORT}/`);
      console.log(`Health check available at: http://localhost:${config.PORT}/health`);
      console.log(`API endpoints available at: http://localhost:${config.PORT}/api/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  const { closeDatabase } = require("./server/database/sqlite");
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  const { closeDatabase } = require("./server/database/sqlite");
  await closeDatabase();
  process.exit(0);
});

startServer();