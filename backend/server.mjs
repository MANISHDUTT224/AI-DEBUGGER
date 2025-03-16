// server.js - Express server setup with fixed API response handling
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createServer } from 'http';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();
// Middleware
app.use(cors());
app.use(express.json());

// Route for code debugging
app.post('/api/debug', async (req, res) => {
  try {
    // Format the prompt for code debugging
    const userCode = req.body.code;
    const prompt = `Analyze and debug this code. Explain any errors and suggest fixes:
    
${userCode}`;

    // Call Hugging Face Inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle different possible response formats from Hugging Face
    let debugResult = '';
    
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      // Format 1: Array with generated_text property
      debugResult = response.data[0].generated_text.replace(prompt, '').trim();
    } else if (typeof response.data === 'string') {
      // Format 2: Direct string response
      debugResult = response.data.replace(prompt, '').trim();
    } else if (response.data?.generated_text) {
      // Format 3: Object with generated_text property
      debugResult = response.data.generated_text.replace(prompt, '').trim();
    } else {
      // Fallback: Return the raw response
      debugResult = JSON.stringify(response.data, null, 2);
    }

    // Send the cleaned-up response back to the client
    res.json({
      debugResult: debugResult || 'No issues found or unable to analyze the code.'
    });
    
  } catch (error) {
    console.error('Error debugging code:', error);
    
    // Improved error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: 'Error from AI service',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: 'No response from AI service. Please try again later.',
        details: 'Request timeout or network issue'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Failed to process your request',
        details: error.message
      });
    }
  }
});

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running properly!' });
});

// WebSocket setup for real-time collaboration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a debugging room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle code updates
  socket.on('code-update', (data) => {
    socket.to(data.roomId).emit('code-update', data.code);
  });

  // Handle debug results
  socket.on('debug-result', (data) => {
    socket.to(data.roomId).emit('debug-result', data.result);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});