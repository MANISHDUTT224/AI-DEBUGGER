// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

// Initialize socket connection
const socket = io('http://localhost:5000');

// Sample code for debugging
const sampleCode = `function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

// This function has a bug
function findMaximum(numbers) {
  if (numbers.length === 0) {
    return null;
  }
  
  let max = numbers[0];
  for (let i = 0; i <= numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}`;

function App() {
  const [code, setCode] = useState('');
  const [debugResult, setDebugResult] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get('http://localhost:5000/api/test');
        setServerStatus('connected');
      } catch (err) {
        setServerStatus('disconnected');
      }
    };
    
    checkServerStatus();
  }, []);

  // Set up socket connection
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    socket.on('debug-result', (result) => {
      setDebugResult(result);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('code-update');
      socket.off('debug-result');
    };
  }, []);

  // Load sample code
  const loadSampleCode = () => {
    setCode(sampleCode);
  };

  // Join a debugging room
  const joinRoom = () => {
    if (roomId) {
      socket.emit('join-room', roomId);
      alert(`Joined room: ${roomId}`);
    } else {
      setError('Please enter a room ID');
    }
  };

  // Handle code changes
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Emit code update to room if in a room
    if (roomId) {
      socket.emit('code-update', { roomId, code: newCode });
    }
  };

  // Submit code for debugging
  const debugCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to debug');
      return;
    }

    setIsDebugging(true);
    setError('');
    setDebugResult(''); // Clear previous results
    
    try {
      const response = await axios.post('http://localhost:5000/api/debug', { code });
      
      console.log("API Response:", response.data); // Log the response for debugging
      
      if (response.data && response.data.debugResult) {
        setDebugResult(response.data.debugResult);
        
        // Emit debug result to room if in a room
        if (roomId) {
          socket.emit('debug-result', { roomId, result: response.data.debugResult });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error debugging code:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Code Debugger</h1>
        <div className="status-indicators">
          <div className="server-status">
            Server: {' '}
            {serverStatus === 'connected' ? (
              <span className="connected">● Connected</span>
            ) : serverStatus === 'disconnected' ? (
              <span className="disconnected">● Disconnected</span>
            ) : (
              <span className="checking">● Checking...</span>
            )}
          </div>
          <div className="socket-status">
            Socket: {' '}
            {isConnected ? (
              <span className="connected">● Connected</span>
            ) : (
              <span className="disconnected">● Disconnected</span>
            )}
          </div>
        </div>
      </header>

      <div className="collaboration-panel">
        <input 
          type="text" 
          placeholder="Enter room ID for collaboration" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)} 
        />
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={loadSampleCode} className="sample-btn">Load Sample Code</button>
      </div>

      <main>
        <div className="code-container">
          <h2>Your Code</h2>
          <textarea 
            value={code} 
            onChange={handleCodeChange} 
            placeholder="Paste your code here or use the 'Load Sample Code' button"
            rows={15}
          />
          <button 
            onClick={debugCode} 
            disabled={isDebugging || serverStatus !== 'connected'}
            className="debug-btn"
          >
            {isDebugging ? 'Analyzing...' : 'Debug Code'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="debug-result">
          <h2>Debug Results</h2>
          <div className="result-container">
            {isDebugging ? (
              <p className="loading">Analyzing your code... This may take a few moments.</p>
            ) : debugResult ? (
              <div className="debug-output">{debugResult}</div>
            ) : (
              <p className="placeholder">
                Debug results will appear here after you submit your code.
                <br /><br />
                {serverStatus !== 'connected' && 
                  "⚠️ Server appears to be offline. Please check your backend server."
                }
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;