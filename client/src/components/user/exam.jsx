import React from 'react';
import RealTimeFaceVerification from './FaceDetection';
import ProctoringEventListener from './ProctoringEventListener';

const Exam = () => {
  // Static exam data
  const exams = [
    {
      _id: '1',
      title: 'Mathematics Final Exam',
      description: 'Covers Algebra, Geometry, and Calculus.',
      date: '2025-08-15',
      duration: '90 minutes',
    },
    {
      _id: '2',
      title: 'Science Midterm',
      description: 'Includes Physics and Chemistry.',
      date: '2025-08-20',
      duration: '60 minutes',
    },
    {
      _id: '3',
      title: 'English Grammar Test',
      description: 'Focus on grammar, comprehension, and vocabulary.',
      date: '2025-08-25',
      duration: '45 minutes',
    },
  ];

  return (
    <div className='p-4'>
    <h1 className="text-xl font-semibold mb-4">Upcoming Exams</h1>
    <div className="flex gap-20 p-4">
            <div>
            {/* Proctoring logic: fullscreen, tab switch, mic detection */}
      <ProctoringEventListener />

      {/* Face recognition component with toast alerts */}
      {/* <FaceVerificationComponent /> */}
      <RealTimeFaceVerification/>
      </div>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li
              key={exam._id}
              className="border border-gray-200 rounded-md p-4 shadow-sm hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-medium">{exam.title}</h2>
              <p className="text-gray-600 text-sm">{exam.description}</p>
              <div className="text-sm mt-2">
                <p><strong>Date:</strong> {exam.date}</p>
                <p><strong>Duration:</strong> {exam.duration}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
    </div>
  );
};

export default Exam;
