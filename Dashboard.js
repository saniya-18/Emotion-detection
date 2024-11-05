import React, { useState, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';
import userAvatar from './user.avif';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [showConsent, setShowConsent] = useState(false);
  const videoRef = useRef(null);
  const [stressDetected, setStressDetected] = useState(false);
  const [emotions, setEmotions] = useState([]);
  const [frames, setFrames] = useState([]); // State to store frames
  const [dailyTasks, setDailyTasks] = useState([5, 6, 7, 8, 4, 5, 6]);

  const navigate = useNavigate(); // Hook for navigating to another page

  const handleGetStarted = () => {
    setShowConsent(true);
  };

  const handleConsentApproval = async () => {
    setShowConsent(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      captureFrames(stream);
    } catch (err) {
      console.error('Webcam access denied', err);
    }
  };

  const captureFrames = async (stream) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    const capturedFrames = [];
    const frameCount = 50;

    for (let i = 0; i < frameCount; i++) {
      context.drawImage(videoRef.current, 0, 0);
      const frameData = canvas.toDataURL('image/jpeg');
      capturedFrames.push(frameData);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    setFrames(capturedFrames); // Store captured frames
    const results = await uploadFrames(capturedFrames);
    if (results) {
      checkStress(results);
    }
  };

  const uploadFrames = async (frames) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames }),
      });
      const result = await response.json();
      return result.results;
    } catch (error) {
      console.error('Error uploading frames:', error);
    }
  };

  const checkStress = (results) => {
    const stressEmotions = ['Angry', 'Disgust', 'Fear', 'Sad'];
    const stressFrames = results.filter((result) => stressEmotions.includes(result.emotion)).length;

    if (stressFrames > 25) {
      setStressDetected(true);
      alert('Stress detected! Take a break.');
    } else {
      setStressDetected(false);
      alert('No stress detected.');
    }

    setEmotions(results);
  };

  const dailyTaskData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Daily Tasks',
        data: dailyTasks,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const dailyTaskOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for legend text
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for x-axis ticks
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for y-axis ticks
        },
      },
    },
  };

  const emotionCounts = emotions.reduce((acc, result) => {
    acc[result.emotion] = (acc[result.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionBarData = {
    labels: ['Happy', 'Sad', 'Angry', 'Fear', 'Disgust', 'Surprise', 'Neutral'],
    datasets: [
      {
        label: 'Emotion Counts',
        data: [
          emotionCounts['Happy'] || 0,
          emotionCounts['Sad'] || 0,
          emotionCounts['Angry'] || 0,
          emotionCounts['Fear'] || 0,
          emotionCounts['Disgust'] || 0,
          emotionCounts['Surprise'] || 0,
          emotionCounts['Neutral'] || 0,
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const emotionBarOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for legend text
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for x-axis ticks
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 253, 208, 1)', // Cream color for y-axis ticks
        },
      },
    },
  };

  const handleCheckPulse = () => {
    navigate('/check-pulse'); // Navigate to the Check Pulse page when clicked
  };

  return (
    <div className="dashboard">
      {/* User Profile and Recommendations */}
      <div className="user-details">
        <img
          className="user-avatar"
          src={userAvatar}
          alt="User Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <h2>Name: John Doe</h2>
        <p>Age: 30</p>

        {/* Move Get Started Button Here */}
        <div className="get-started-container">
          <button className="btn get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>

        <div className="recommendations">
          <h3>Recommendations:</h3>
          <ul>
            <li>Take a 5-minute walk</li>
            <li>Practice deep breathing</li>
            <li>Stretch your muscles</li>
            <li>Hydrate and take a break</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {showConsent && (
          <div className="consent-popup">
            <p>We need your consent to access the webcam.</p>
            <button className="btn" onClick={handleConsentApproval}>
              Give Consent
            </button>
            <button className="btn" onClick={() => setShowConsent(false)}>
              Cancel
            </button>
          </div>
        )}

        <video ref={videoRef} autoPlay style={{ display: 'none' }} />

        <div className="charts-container">
          <div className="line-chart chart-overlay">
            <h3>Daily Tasks</h3>
            <Line data={dailyTaskData} options={dailyTaskOptions} />
            <div className="overlay">Monitoring daily progress</div>
          </div>

          <div className="bar-chart chart-overlay">
            <h3>Emotion Detection</h3>
            <Bar data={emotionBarData} options={emotionBarOptions} />
            <div className="overlay">Detecting emotions</div>
          </div>
        </div>

        {emotions.length > 0 && (
          <div className="emotion-results">
            <h3>Detected Emotions:</h3>
            <ul>
              {emotions.map((result, index) => (
                <li key={index}>
                  {frames[index] && (
                    <img
                      src={frames[index]} // Display corresponding frame image
                      alt={`Frame ${index + 1}`} // Use template literal for dynamic alt text
                      style={{ width: '100px', height: '100px', borderRadius: '10px', marginRight: '10px' }}
                    />
                  )}
                  Frame {index + 1}: {result.emotion}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pulse-button-container">
          <button className="btn pulse-btn" onClick={handleCheckPulse}>
            Check Pulse
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;