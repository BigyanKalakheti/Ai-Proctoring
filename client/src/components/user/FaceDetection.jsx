import React, { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import * as faceapi from "face-api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Camera as CameraIcon, 
  Shield, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity
} from "lucide-react";
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { getUserIdFromToken } from "../../utils/getUserIdFromToken";


const BEEP_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

export default function RealTimeFaceVerification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const beepSound = useRef(null);

  const [faceStatus, setFaceStatus] = useState("Loading models...");
  const [logs, setLogs] = useState([]);
  const [showEnrollButton, setShowEnrollButton] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const enrolledDescriptor = useRef(null);
  const lastFaceState = useRef(null);
  const pendingEnrollment = useRef(false);
  const consecutiveNoFaceCount = useRef(0);
  const MAX_NO_FACE_FRAMES = 5;
  const examId = "687220f4bb379546cf243ae2"
  const userId = getUserIdFromToken();

  useEffect(() => {
    beepSound.current = new Audio(BEEP_URL);

    const MODEL_URL = "/models";

    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setFaceStatus("Models loaded, starting camera...");
        setIsLoading(false);
        startCameraAndDetection();
      } catch (error) {
        setFaceStatus("Error loading models");
        setIsLoading(false);
        toast.error("Failed to load face detection models");
      }
    }

    loadModels();
  }, []);

  const playAlert = () => {
    if (beepSound.current) beepSound.current.play();
    if (navigator.vibrate) navigator.vibrate(200);
  };

  const addLog = (event) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, event }, ...prev.slice(0, 9)]);
  };

  const handleEnroll = () => {
    pendingEnrollment.current = true;
    toast.info("📸 Please face the camera clearly for enrollment");
  };

  const getStatusIcon = () => {
    if (faceStatus.includes("No")) return <XCircle className="w-6 h-6 text-red-500" />;
    if (faceStatus.includes("Unauthorized")) return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (faceStatus.includes("Multiple")) return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    if (faceStatus.includes("Authorized")) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (faceStatus.includes("enrolled")) return <Shield className="w-6 h-6 text-blue-500" />;
    return <Clock className="w-6 h-6 text-gray-500" />;
  };

  const getStatusColor = () => {
    if (faceStatus.includes("No") || faceStatus.includes("Unauthorized")) return "text-red-600";
    if (faceStatus.includes("Multiple")) return "text-orange-600";
    if (faceStatus.includes("Authorized")) return "text-green-600";
    if (faceStatus.includes("enrolled")) return "text-blue-600";
    return "text-gray-600";
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
        ctx.strokeStyle = "#10b981";
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
            position: "bottom-right",
            closeButton: true,
            draggable: true,
          });
          playAlert();
          addLog("No face detected");
          lastFaceState.current = "no-face";
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.toBlob(async (blob) => {
              if (!blob) return;

              try {
                const uploadedUrl = await uploadToCloudinary(blob);
                console.log('✅ Evidence uploaded:', uploadedUrl);

                // Send violation to backend
                const token = localStorage.getItem('token');
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    examId, 
                    userId,
                    type: 'no-face-detected',
                    evidenceUrl: uploadedUrl,
                    severity:'medium',
                    description: 'No face detected during exam',
                  }),
                });
                console.log('🚀 Violation logged successfully');
              } catch (err) {
                console.error('Failed to upload violation evidence or log violation:', err);
              }
            }, 'image/jpeg');
          }
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
            position: "bottom-right",
          });
          playAlert();
          addLog("Multiple faces detected");
          lastFaceState.current = "multi-face";
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.toBlob(async (blob) => {
              if (!blob) return;

              try {
                const uploadedUrl = await uploadToCloudinary(blob);
                console.log('✅ Evidence uploaded:', uploadedUrl);

                // Send violation to backend
                const token = localStorage.getItem('token');
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    examId, 
                    userId,
                    type: 'multiple-faces',
                    evidenceUrl: uploadedUrl,
                    severity: "high",
                    description: 'Multiple faces detected during exam',
                  }),
                });
                console.log('🚀 Violation logged successfully');
              } catch (err) {
                console.error('Failed to upload violation evidence or log violation:', err);
              }
            }, 'image/jpeg');
          }
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

        if (pendingEnrollment.current && !enrolledDescriptor.current) {
          enrolledDescriptor.current = detection.descriptor;
          setShowEnrollButton(false);
          pendingEnrollment.current = false;
          toast.success("✅ Face enrolled successfully", { autoClose: 2000,              closeOnClick: true,
              closeButton: true });
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
              position: "bottom-right",
            });
          }
          playAlert();
          addLog("Unauthorized face detected");
            // ✅ Capture canvas as image and upload
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.toBlob(async (blob) => {
              if (!blob) return;

              try {
                const uploadedUrl = await uploadToCloudinary(blob);
                console.log('✅ Evidence uploaded:', uploadedUrl);

                // Send violation to backend
                const token = localStorage.getItem('token');
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    examId, 
                    userId,
                    type: 'unauthorized-face',
                    evidenceUrl: uploadedUrl,
                    severity: "high",
                    description: 'Unauthorized face detected during exam',
                  }),
                });
                console.log('🚀 Violation logged successfully');
              } catch (err) {
                console.error('Failed to upload violation evidence or log violation:', err);
              }
            }, 'image/jpeg');
          }
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
    <div className=" bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Face Verification System</h1>
          </div>
          <p className="text-slate-300">Advanced real-time face detection and verification</p>
        </div>

        <div >
          {/* Main Camera Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <h2 className={`text-lg font-semibold ${getStatusColor()}`}>
                      {faceStatus}
                    </h2>
                    <p className="text-sm text-slate-400">Live monitoring active</p>
                  </div>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              {/* Camera View */}
              <div className="relative mb-6">
                <video
                  ref={videoRef}
                  className="hidden"
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
                  className="w-full h-auto rounded-xl shadow-2xl border-2 border-white/20 bg-black"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Controls */}
              <div className="flex justify-center">
                {showEnrollButton && (
                  <button
                    onClick={handleEnroll}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <User className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Enroll Face
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        pauseOnHover
        theme="dark"
        toastClassName="!bg-slate-800 !text-white"
      />
    </div>
  );
}