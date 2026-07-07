import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const CameraCapture = forwardRef(function CameraCapture({ onCapture, capturedImage, error, title = 'Camera' }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('Waiting for camera access...');

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraMessage('Camera access is not supported in this browser.');
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setReady(true);
          setCameraMessage('Camera is ready.');
        }
      } catch (err) {
        console.error(err);
        setCameraMessage('Camera permission was denied.');
      }
    }

    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    onCapture?.(imageData);
    return imageData;
  }, [onCapture]);

  useImperativeHandle(ref, () => ({ capture }));

  return (
    <div className="card">
      <h3>{title}</h3>
      {(error || cameraMessage) && <div className={`notice ${error ? 'error' : ''}`}>{error || cameraMessage}</div>}
      <div>
        <video ref={videoRef} className="camera-preview" playsInline muted />
        <button type="button" onClick={capture} disabled={!ready} style={{ marginTop: 12 }}>
          Capture Frame
        </button>
        {capturedImage && <img src={capturedImage} alt="Captured preview" className="preview-image" />}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
});

export default CameraCapture;
