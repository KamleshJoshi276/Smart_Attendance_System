import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const CameraCapture = forwardRef(function CameraCapture(
  { onCapture, capturedImage, error, title = 'Camera' },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Waiting for camera access...");

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraMessage("Camera is not supported in this browser.");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await videoRef.current.play();

          setReady(true);
          setCameraMessage("Camera Ready");
        }

      } catch (err) {

        console.error("Camera Error:", err);

        if (err.name === "NotAllowedError") {
          setCameraMessage("Camera permission denied.");
        } else if (err.name === "NotFoundError") {
          setCameraMessage("No camera found.");
        } else if (err.name === "NotReadableError") {
          setCameraMessage("Camera is already being used by another application.");
        } else {
          setCameraMessage(err.message);
        }
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

    if (!video || !canvas) return null;

    if (video.videoWidth === 0 || video.videoHeight === 0)
      return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.9);

    if (onCapture) onCapture(img);

    return img;

  }, [onCapture]);

  useImperativeHandle(ref, () => ({
    capture
  }));

  return (
    <div className="card">

      <h3>{title}</h3>

      <div className="notice">
        {error || cameraMessage}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-preview"
      />

      <button
        type="button"
        disabled={!ready}
        onClick={capture}
        style={{ marginTop: 10 }}
      >
        Capture Frame
      </button>

      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured"
          className="preview-image"
        />
      )}

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

    </div>
  );
});
