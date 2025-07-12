
import React, { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import * as faceapi from "face-api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BEEP_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

export default function RealTimeFaceVerification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const beepSound = useRef(null);

  const [faceStatus, setFaceStatus] = useState("Loading models...");
  const [logs, setLogs] = useState([]);
  const [showEnrollButton, setShowEnrollButton] = useState(true);

  const enrolledDescriptor = useRef(null);
  const lastFaceState = useRef(null);
  const pendingEnrollment = useRef(false);
  const consecutiveNoFaceCount = useRef(0);
  const MAX_NO_FACE_FRAMES = 5;

  useEffect(() => {
    beepSound.current = new Audio(BEEP_URL);

    const MODEL_URL = "/models";

    async function loadModels() {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setFaceStatus("Models loaded, starting camera...");
      startCameraAndDetection();
    }

    loadModels();
  }, []);

  const playAlert = () => {
    if (beepSound.current) beepSound.current.play();
    if (navigator.vibrate) navigator.vibrate(200);
  };

  const addLog = (event) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, event }, ...prev]);
  };

  const handleEnroll = () => {
    pendingEnrollment.current = true;
    toast.info("📸 Please face the camera clearly for enrollment");
  };

  function startCameraAndDetection() {
    if (!videoRef.current || !canvasRef.current) return;

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults(async (results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      const detections = results.detections || [];
      const faceCount = detections.length;

      detections.forEach((detection) => {
        const box = detection.boundingBox;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "lime";
        ctx.rect(
          box.xCenter * canvas.width - (box.width * canvas.width) / 2,
          box.yCenter * canvas.height - (box.height * canvas.height) / 2,
          box.width * canvas.width,
          box.height * canvas.height
        );
        ctx.stroke();
      });

      if (faceCount === 0) {
        setFaceStatus("No face detected");
        if (lastFaceState.current !== "no-face") {
          toast.warn("⚠️ No face detected!", {
            toastId: "no-face",
            autoClose: false,
            closeOnClick: true,
            closeButton: true,
            draggable: true,
          });
          playAlert();
          addLog("No face detected");
          lastFaceState.current = "no-face";
        }
        return;
      }

      if (faceCount > 1) {
        setFaceStatus(`Multiple faces detected: ${faceCount}`);
        if (lastFaceState.current !== "multi-face") {
          toast.error("🚨 Multiple faces detected!", {
            toastId: "multi-face",
              autoClose: 5000,
              closeOnClick: true,
              closeButton: true,
              draggable: true,
              position: "top-right",
          });
          playAlert();
          addLog("Multiple faces detected");
          lastFaceState.current = "multi-face";
        }
        return;
      }

      toast.dismiss("no-face");
      toast.dismiss("multi-face");
      lastFaceState.current = "single-face";

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          consecutiveNoFaceCount.current += 1;

          if (consecutiveNoFaceCount.current >= MAX_NO_FACE_FRAMES) {
            setFaceStatus("Try facing the camera clearly");
          }

          return;
        } else {
          consecutiveNoFaceCount.current = 0;
        }

        // Enrollment logic
        if (pendingEnrollment.current && !enrolledDescriptor.current) {
          enrolledDescriptor.current = detection.descriptor;
          setShowEnrollButton(false);
          pendingEnrollment.current = false;
          toast.success("✅ Face enrolled successfully", { autoClose: 3000 });
          addLog("Face enrolled");
          setFaceStatus("Face enrolled, monitoring...");
          return;
        }

        if (!enrolledDescriptor.current) {
          setFaceStatus("Waiting for face enrollment...");
          return;
        }

        const distance = faceapi.euclideanDistance(
          enrolledDescriptor.current,
          detection.descriptor
        );
        const threshold = 0.6;

        if (distance > threshold) {
          setFaceStatus("Unauthorized face detected!");
          if (!toast.isActive("unauthorized-face")){
          toast.error("🚨 Unauthorized face detected!", {
            toastId: "unauthorized-face",
              autoClose: 5000,
              closeOnClick: true,
              closeButton: true,
              draggable: true,
              position: "top-right",
          });
          }
          playAlert();
          addLog("Unauthorized face detected");
        } else {
          setFaceStatus("Authorized face detected");
        }
      } catch (error) {
        console.error("Error in face-api detection:", error);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceDetection.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto", textAlign: "center" }}>
      <h2
        style={{
          color:
            faceStatus.includes("No") || faceStatus.includes("Unauthorized")
              ? "red"
              : faceStatus.includes("Multiple")
              ? "orange"
              : "green",
        }}
      >
        {faceStatus}
      </h2>

      {showEnrollButton && (
        <button
          onClick={handleEnroll}
          style={{
            padding: "10px 20px",
            marginBottom: 20,
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Enroll Face
        </button>
      )}

      <video
        ref={videoRef}
        style={{ display: "none" }}
        width={640}
        height={480}
        muted
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ borderRadius: 8, boxShadow: "0 0 10px rgba(0,0,0,0.3)" }}
      />
      <ToastContainer position="top-right" autoClose={5000} pauseOnHover />
      <div
        style={{
          marginTop: 20,
          textAlign: "left",
          maxHeight: 150,
          overflowY: "auto",
          background: "#f0f0f0",
          padding: 10,
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <h4>Event Logs (latest first):</h4>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {logs.map((log, i) => (
            <li key={i}>
              <b>{log.timestamp}:</b> {log.event}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

