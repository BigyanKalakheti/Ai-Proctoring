import React from 'react';
import { Timer } from './Timer';

export const ExamHeader = ({ exam, onTimeUp, onSubmit }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
          <p className="text-gray-600">{exam.description}</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <Timer duration={exam.duration} onTimeUp={onTimeUp} />
          <button
            onClick={onSubmit}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};
