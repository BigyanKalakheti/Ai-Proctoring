import React from 'react';

export const QuestionDisplay = ({
  question,
  currentAnswer,
  onAnswerChange,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-blue-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {question.points} points
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-4">
        {question.type === 'multiple-choice' ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`
                  flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${currentAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                  ${currentAnswer === option
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                  }
                `}>
                  {currentAnswer === option && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <div>
            <textarea
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
              rows={6}
            />
            <div className="mt-2 text-sm text-gray-500">
              {currentAnswer.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};