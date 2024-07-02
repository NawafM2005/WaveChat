// CameraPopup.js
import React, { useEffect, useRef } from 'react';
import './cameraPopup.css'

const CameraPopup = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
  
    useEffect(() => {
      let stream = null;
  
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        } catch (err) {
          console.error('Error accessing the camera: ', err);
        }
      };
  
      startCamera();
  
      return () => {
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }, []);
  
    const handleCaptureClick = () => {
      try {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const image = canvasRef.current.toDataURL('image/jpeg');
        onCapture(image);
      } catch (err) {
        alert(err.message);
      }
    };

  return (
    <div className="camera-popup">
      <div className="camera-popup-header">
        <button onClick={onClose}>Close</button>
        <button onClick={handleCaptureClick}>Capture</button>
      </div>
      <div className="camera-popup-body">
        <video ref={videoRef} width="100%" height="100%"/>
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
      </div>
    </div>
  );
};

export default CameraPopup;
