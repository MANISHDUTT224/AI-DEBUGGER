# AI Code Debugger



<p align="center">
  An intelligent code debugging tool with real-time collaboration features.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#license">License</a>
</p>

## Features

✨ **AI-Powered Debugging**
- Analyzes code for syntax errors, logic issues, and inefficiencies
- Provides intelligent fix suggestions
- Supports multiple programming languages

🤝 **Real-Time Collaboration**
- Debug code together with teammates
- Share code and debug results instantly
- Room-based collaboration system

🚀 **Developer-Friendly**
- Simple, intuitive interface
- Sample code library for testing
- Responsive design works on desktop and mobile


## Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Hugging Face account and API key

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-code-debugger.git
cd ai-code-debugger
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# In the backend directory, create a .env file
echo "PORT=5000
HUGGINGFACE_API_KEY=your_huggingface_api_key" > .env
```

4. Start the development servers:
```bash
# Start the backend server
cd backend
node server.js

# In a new terminal, start the frontend
cd frontend
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## How It Works

### Architecture

The application follows a client-server architecture:

- **Frontend**: React.js application with Socket.io client
- **Backend**: Node.js Express server with Socket.io
- **AI Service**: Hugging Face Inference API

### AI Integration

The application sends code to the Hugging Face Inference API, which processes it using the zephyr-7b-beta model. The AI analyzes the code and returns debugging suggestions, which are then displayed to the user.

### Collaborative Features

When multiple users join the same room:
1. Code changes are broadcast to all users in real-time
2. Debugging results are shared with everyone
3. Everyone sees the same code and results simultaneously


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by Manish Dutt
</p>
