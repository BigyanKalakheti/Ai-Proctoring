import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProctoringEventListener = () => {
  useEffect(() => {
    const notify = (msg, id) => {
      if (!toast.isActive(id)) {
        toast.info(msg, {
          toastId: id,
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    // === Fullscreen change detection ===
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        notify("Event: Exited fullscreen", "fullscreen-exit");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // === Tab switch / blur detection ===
    const handleVisibilityChange = () => {
      if (document.hidden) {
        notify("🕵️ Event: Tab switched or minimized", "tab-switched");
      } else {
        notify("🔙 Event: User returned to tab", "tab-returned");
      }
    };

    const handleBlur = () => notify("Event: Window lost focus", "window-blur");
    const handleFocus = () => notify("Event: Window gained focus", "window-focus");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // === High mic volume detection ===
    let audioContext;
    let analyser;
    let micStream;
    let rafId;

    const monitorMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        const checkVolume = () => {
          analyser.getByteTimeDomainData(data);
          let max = 0;
          for (let i = 0; i < data.length; i++) {
            max = Math.max(max, Math.abs(data[i] - 128));
          }
          if (max > 80 && !toast.isActive("high-sound")) {
            toast.warn("🔊 Event: High sound level detected", {
              toastId: "high-sound",
              autoClose: 5000,
              closeOnClick: true,
              closeButton: true,
              draggable: true,
              position: "top-right",
            });
          }
          rafId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        toast.error("Microphone access denied or error");
      }
    };

    monitorMic();

    // === Cleanup ===
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
