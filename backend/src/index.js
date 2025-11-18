import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "./config/cors.config.js";
import { setupMiddlewares } from "./config/app.config.js";
import videoRoutes from "./routes/video.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Setup CORS
app.use(corsConfig);

// Setup middlewares
setupMiddlewares(app);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Video Streaming API with Transcription & Translation" });
});

app.use("/api", videoRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});