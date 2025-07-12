import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 300) return 'text-red-600'; // less than 5 minutes
    if (timeLeft < 900) return 'text-yellow-600'; // less than 15 minutes
    return 'text-green-600';
  };

  return (
    <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${getTimerColor()}`}>
      <Clock size={20} />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};