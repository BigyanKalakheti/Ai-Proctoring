import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { ExamHeader } from './ExamHeader';
import { VideoStream } from './VideoStream';
import { QuestionNavigation } from './QuestionNavigation';
import { QuestionDisplay } from './QuestionDisplay';

export const ExamPortal = ({ exam }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examStartTime] = useState(new Date());
  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion._id)?.answer || '';
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const saveAnswer = useCallback((questionId, answer) => {
    setAnswers(prevAnswers => {
      const existingIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      const newAnswer = {
        questionId,
        answer,
        timestamp: new Date()
      };

      if (existingIndex >= 0) {
        const newAnswers = [...prevAnswers];
        newAnswers[existingIndex] = newAnswer;
        return newAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });
  }, []);

  const handleAnswerChange = (answer) => {
    saveAnswer(currentQuestion._id, answer);
  };

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < exam.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };

  // const handleSubmit = () => {
  //   const confirmed = window.confirm('Are you sure you want to submit your exam? This action cannot be undone.');
  //   if (confirmed) {
  //     setIsSubmitted(true);
  //     // Here you would typically send the answers to your backend
  //     console.log('Submitting answers:', answers);
  //   }
  // };
  const handleSubmit = async () => {
  const confirmed = window.confirm('Are you sure you want to submit your exam? This action cannot be undone.');
  if (!confirmed) return;

  setIsSubmitted(true);

  // Construct payload for backend:
  const payload = {
    examId: exam._id,
    answers: answers.map(a => ({
      questionId: a.questionId,
      userAnswer: a.answer
    })),
    startTime: examStartTime, // you can track start time in state
    endTime: new Date(),
    status: 'completed'
  };

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API}/exams/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // include authorization token if your backend requires it
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Submission failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Exam submitted successfully:', data);
    // optionally show success message or redirect user
  } catch (error) {
    console.error('Error submitting exam:', error);
    alert('Failed to submit exam. Please try again.');
    setIsSubmitted(false); // allow retry
  }
};


  const handleTimeUp = () => {
    alert('Time is up! Your exam will be automatically submitted.');
    setIsSubmitted(true);
  };

  const getAnsweredCount = () => {
    return exam.questions.filter(q => 
      answers.some(a => a.questionId === q._id && a.answer.trim() !== '')
    ).length;
  };

  const isAllAnswered = getAnsweredCount() === exam.questions.length;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckSquare size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your exam has been submitted successfully. You answered {getAnsweredCount()} out of {exam.questions.length} questions.
          </p>
          <div className="text-sm text-gray-500">
            Submitted at: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ExamHeader exam={exam} onTimeUp={handleTimeUp} onSubmit={handleSubmit} />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-120 bg-gray-50 p-6 space-y-6 overflow-y-auto">
          <VideoStream />
          <QuestionNavigation
            questions={exam.questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onQuestionSelect={navigateToQuestion}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <QuestionDisplay
              question={currentQuestion}
              currentAnswer={currentAnswer}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={exam.questions.length}
            />

            {/* Navigation Controls */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
                {currentQuestionIndex + 1} of {exam.questions.length}
              </div>

              {currentQuestionIndex === exam.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isAllAnswered
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  <CheckSquare size={20} />
                  <span>Finish Exam</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};