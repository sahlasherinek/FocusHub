import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes';
import { createServer } from "http";
import authRoutes from './routes/authRoutes';
import { auth } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes Setup
app.use('/api/auth', authRoutes);          // public: unified login/register
app.use('/api/todos', auth, todoRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('Successfully connected to MongoDB');

    //health check route
    app.get("/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Server is running successfully",
        timestamp: new Date().toISOString(),
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

    });
    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  })
  .catch(err => console.error('Database connection breakdown error:', err));


