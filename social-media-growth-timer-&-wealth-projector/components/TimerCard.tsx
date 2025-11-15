import React from 'react';
import type { Timer } from '../types';

interface TimerCardProps {
  timer: Timer;
  onToggle: (id: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const TimerCard: React.FC<TimerCardProps> = ({ timer, onToggle }) => {
  const isRunning = timer.isRunning;
  const cardBorderColor = isRunning ? 'border-pink-500' : 'border-gray-700';
  const buttonBgColor = isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  const progress = ((1800 - timer.timeLeft) / 1800) * 100;

  return (
    <div className={`bg-[#242526] rounded-xl shadow-lg p-6 border-2 ${cardBorderColor} transition-all duration-300 flex flex-col`}>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-blue-400">{timer.title}</h3>
        <p className="text-slate-400 mt-2 text-sm">{timer.description}</p>
        <div className="my-6 text-center">
          <span className="text-6xl font-mono font-bold text-white tracking-wider">{formatTime(timer.timeLeft)}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <button
        onClick={() => onToggle(timer.id)}
        className={`w-full py-3 text-lg font-semibold text-white rounded-lg ${buttonBgColor} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#242526] focus:ring-pink-400`}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

export default TimerCard;