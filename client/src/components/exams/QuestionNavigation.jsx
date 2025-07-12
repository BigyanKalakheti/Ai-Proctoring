import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export const QuestionNavigation = ({
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect,
}) => {
  const isQuestionAnswered = (questionId) => {
    return answers.some(answer => answer.questionId === questionId && answer.answer.trim() !== '');
  };

  const getAnsweredCount = () => {
    return questions.filter(q => isQuestionAnswered(q._id)).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions</h3>
        <div className="text-sm text-gray-600">
          Progress: {getAnsweredCount()}/{questions.length} answered
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => (
          <button
            key={question._id}
            onClick={() => onQuestionSelect(index)}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
              ${currentQuestionIndex === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-1">
              <span className="text-sm font-medium">{index + 1}</span>
              {isQuestionAnswered(question._id) ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};