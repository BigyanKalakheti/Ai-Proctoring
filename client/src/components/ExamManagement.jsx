import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Clock, Users } from 'lucide-react';
import { mockExams } from '../data/mockData';

const ExamManagement = () => {
  const [exams, setExams] = useState(mockExams);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = exams.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateExam = (examData) => {
    const newExam = {
      ...examData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExams([...exams, newExam]);
    setShowCreateModal(false);
  };

  const handleDeleteExam = (examId) => {
    setExams(exams.filter(exam => exam.id !== examId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Exam Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentExams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{exam.title}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{exam.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                {exam.duration} minutes
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                {exam.questions.length} questions
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(exam.createdAt).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedExam(exam)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, exams.length)} of {exams.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded-lg ${
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateExam}
        />
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <ExamDetailsModal
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
};

const CreateExamModal = ({ onClose, onCreate }) => {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 60,
    status: 'draft'
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    points: 10
  });

  const handleAddQuestion = () => {
    if (currentQuestion.question) {
      const newQuestion = {
        id: Date.now().toString(),
        type: currentQuestion.type,
        question: currentQuestion.question,
        options: currentQuestion.type === 'multiple-choice' ? currentQuestion.options : undefined,
        correctAnswer: currentQuestion.type === 'multiple-choice' ? currentQuestion.correctAnswer : undefined,
        points: currentQuestion.points || 10
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        points: 10
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...examData,
      questions
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create New Exam</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                value={examData.title}
                onChange={(e) => setExamData({...examData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={examData.duration}
                onChange={(e) => setExamData({...examData, duration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={examData.description}
              onChange={(e) => setExamData({...examData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>

          {/* Questions */}
          <div>
            <h4 className="text-lg font-medium mb-4">Questions ({questions.length})</h4>
            
            {/* Add Question Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion, 
                      type: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="paragraph">Paragraph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion, 
                      points: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion, 
                    question: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>

              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option}
                        checked={currentQuestion.correctAnswer === option}
                        onChange={(e) => setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswer: e.target.value
                        })}
                        className="text-indigo-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(currentQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOptions
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Question
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium text-indigo-600">
                        {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Paragraph'} • {question.points} points
                      </span>
                      <p className="text-gray-900 mt-1">{question.question}</p>
                      {question.options && (
                        <div className="mt-2 text-sm text-gray-600">
                          {question.options.map((option, i) => (
                            <div key={i} className={`${option === question.correctAnswer ? 'font-semibold' : ''}`}>
                              {String.fromCharCode(65 + i)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter(q => q.id !== question.id))}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExamDetailsModal = ({ exam, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Exam Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-900">{exam.title}</h4>
            <p className="text-gray-600 mt-2">{exam.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{exam.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                exam.status === 'published' ? 'bg-green-100 text-green-800' :
                exam.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {exam.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="font-medium">{exam.questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Questions:</h5>
            <div className="space-y-2">
              {exam.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-indigo-600">
                      Q{index + 1}. {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Paragraph'} • {question.points} points
                    </span>
                  </div>
                  <p className="text-gray-900">{question.question}</p>
                  {question.options && (
                    <div className="mt-2 text-sm text-gray-600">
                      {question.options.map((option, i) => (
                        <div key={i} className={`${option === question.correctAnswer ? 'font-semibold text-green-600' : ''}`}>
                          {String.fromCharCode(65 + i)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamManagement;
