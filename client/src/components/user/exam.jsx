import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // if you're using React Router
import { ExamPortal } from '../exams/ExamPortal';

function Exam() {
  const examId  = '687220f4bb379546cf243ae2'; // Make sure your route is like /exam/:examId
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch exam');
        const data = await response.json();
        setExam(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  if (loading) return <div className="p-6">Loading exam...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!exam) return <div className="p-6 text-gray-600">No exam data.</div>;

  return <ExamPortal exam={exam} />;
}

export default Exam;
