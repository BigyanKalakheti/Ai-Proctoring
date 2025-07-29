// import React, { useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
// import { getUserIdFromToken } from "../../utils/getUserIdFromToken";

// const ProctoringEventListener = () => {
//     const examId = "687220f4bb379546cf243ae2"
//     const userId = getUserIdFromToken();
//   useEffect(() => {
//     const notify = (msg, id) => {
//       if (!toast.isActive(id)) {
//         toast.info(msg, {
//           toastId: id,
//           position: "top-right",
//           autoClose: 5000,
//         });
//       }
//     };

//     // === Fullscreen change detection ===
//     const handleFullscreenChange =async () => {
//       if (!document.fullscreenElement) {
//         notify("Event: Exited fullscreen", "fullscreen-exit");
//         try {
//             // Send violation to backend
//             const token = localStorage.getItem('token');
//             await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//               },
//               body: JSON.stringify({
//                 examId, 
//                 userId,
//                 type: 'fullscreen-exit',
//                 severity:'medium',
//                 description: 'User exited full screen',
//               }),
//             });
//             console.log('🚀 Violation logged successfully');
//           } catch (err) {
//             console.error('Failed to upload violation evidence or log violation:', err);
//           }
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);

//     // === Tab switch / blur detection ===
//     const handleVisibilityChange = async() => {
//       if (document.hidden) {
//         notify("🕵️ Event: Tab switched or minimized", "tab-switched");
//         try {
//           // Send violation to backend
//           const token = localStorage.getItem('token');
//           await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               examId, 
//               userId,
//               type: 'tab-switch',
//               severity:'medium',
//               description: 'Possible tab switch detected during exam',
//             }),
//           });
//           console.log('🚀 Violation logged successfully');
//         } catch (err) {
//           console.error('Failed to upload violation evidence or log violation:', err);
//         }
//       } else {
//         notify("🔙 Event: User returned to tab", "tab-returned");
//       }
//     };

//     const handleBlur = async() =>{ 
//       notify("Event: Window lost focus", "window-blur")
//       try {
//             // Send violation to backend
//             const token = localStorage.getItem('token');
//             await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//               },
//               body: JSON.stringify({
//                 examId, 
//                 userId,
//                 type: 'window-blur',
//                 severity:'low',
//                 description: 'User may have clicked somewhere off thescreen',
//               }),
//             });
//             console.log('🚀 Violation logged successfully');
//           } catch (err) {
//             console.error('Failed to upload violation evidence or log violation:', err);
//           }



//     };
//     const handleFocus = () => notify("Event: Window gained focus", "window-focus");

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     window.addEventListener("blur", handleBlur);
//     window.addEventListener("focus", handleFocus);

//     // === High mic volume detection ===
//     let audioContext;
//     let analyser;
//     let micStream;
//     let rafId;

//     const monitorMic = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         micStream = stream;
//         audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const source = audioContext.createMediaStreamSource(stream);
//         analyser = audioContext.createAnalyser();
//         source.connect(analyser);

//         const data = new Uint8Array(analyser.fftSize);
//         const checkVolume = async() => {
//           analyser.getByteTimeDomainData(data);
//           let max = 0;
//           for (let i = 0; i < data.length; i++) {
//             max = Math.max(max, Math.abs(data[i] - 128));
//           }
//           if (max > 80 && !toast.isActive("high-sound")) {
//             toast.warn("🔊 Event: High sound level detected", {
//               toastId: "high-sound",
//               autoClose: 5000,
//               closeOnClick: true,
//               closeButton: true,
//               draggable: true,
//               position: "top-right",
//             });
//           }
//           rafId = requestAnimationFrame(checkVolume);
//           try {
//             // Send violation to backend
//             const token = localStorage.getItem('token');
//             await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//               },
//               body: JSON.stringify({
//                 examId, 
//                 userId,
//                 type: 'speech-detected',
//                 severity:'low',
//                 description: 'High volume sound detected',
//               }),
//             });
//             console.log('🚀 Violation logged successfully');
//           } catch (err) {
//             console.error('Failed to upload violation evidence or log violation:', err);
//           }
//         };

//         checkVolume();
//       } catch (err) {
//         toast.error("Microphone access denied or error");
//       }
//     };

//     monitorMic();

//     // === Cleanup ===
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       window.removeEventListener("blur", handleBlur);
//       window.removeEventListener("focus", handleFocus);
//       cancelAnimationFrame(rafId);
//       if (micStream) {
//         micStream.getTracks().forEach((track) => track.stop());
//       }
//       if (audioContext) {
//         audioContext.close();
//       }
//     };
//   }, []);

//   return <ToastContainer />;
// };

// export default ProctoringEventListener;

import React, { useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { getUserIdFromToken } from "../../utils/getUserIdFromToken";

const ProctoringEventListener = () => {
  const examId = "687220f4bb379546cf243ae2";
  const userId = getUserIdFromToken();

  // Track whether violations are in progress (per type)
  const violationFlags = useRef({
    fullscreen: false,
    tabSwitch: false,
    windowBlur: false,
    mic: false,
  });

  useEffect(() => {
    const notify = (msg, id) => {
      if (!toast.isActive(id)) {
        toast.info(msg, {
          toastId: id,
          position: "bottom-right",
          autoClose: 5000,
        });
      }
    };

    const reportViolation = async (type, severity, description, flagKey, toastId = null) => {
      if (violationFlags.current[flagKey]) return;
      violationFlags.current[flagKey] = true;

      if (toastId) {
        notify(description, toastId);
      }

      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/violations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ examId, userId, type, severity, description }),
        });
        console.log(`🚀 Violation [${type}] logged successfully`);
      } catch (err) {
        console.error(`❌ Error logging violation [${type}]:`, err);
      } finally {
        // Allow next report after short cooldown
        setTimeout(() => {
          violationFlags.current[flagKey] = false;
        }, 3000);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation('fullscreen-exit', 'medium', 'User exited fullscreen', 'fullscreen', 'fullscreen-exit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('tab-switch', 'medium', 'Possible tab switch detected during exam', 'tabSwitch', 'tab-switched');
      } else {
        notify("🔙 Event: User returned to tab", "tab-returned");
      }
    };

    const handleBlur = () => {
      reportViolation('window-blur', 'low', 'User may have clicked somewhere off the screen', 'windowBlur', 'window-blur');
    };

    const handleFocus = () => {
      notify("Event: Window gained focus", "window-focus");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // === High mic volume detection ===
    let audioContext, analyser, micStream, rafId;

    const monitorMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        const checkVolume = async () => {
          analyser.getByteTimeDomainData(data);
          let max = 0;
          for (let i = 0; i < data.length; i++) {
            max = Math.max(max, Math.abs(data[i] - 128));
          }

          if (max > 80 && !toast.isActive("high-sound")) {
            toast.warn("🔊 Event: High sound level detected", {
              toastId: "high-sound",
              autoClose: 5000,
              position: "bottom-right",
            });

            reportViolation(
              'speech-detected',
              'low',
              'High volume sound detected',
              'mic'
            );
          }

          rafId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        toast.error("Microphone access denied or error");
      }
    };

    monitorMic();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      cancelAnimationFrame(rafId);
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return <ToastContainer />;
};

export default ProctoringEventListener;
