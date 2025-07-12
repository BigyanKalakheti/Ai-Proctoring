export const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Computer Science',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Mathematics',
    createdAt: '2024-01-14T14:20:00Z',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@email.com',
    photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Physics',
    createdAt: '2024-01-13T09:15:00Z',
    status: 'inactive'
  }
];

export const mockExams = [
  {
    id: '1',
    title: 'Data Structures Final Exam',
    description: 'Comprehensive test covering arrays, linked lists, trees, and graphs',
    duration: 120,
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 'O(log n)',
        points: 10
      },
      {
        id: '2',
        type: 'paragraph',
        question: 'Explain the difference between a stack and a queue with examples.',
        points: 20
      }
    ],
    createdAt: '2024-01-10T08:00:00Z',
    status: 'published'
  }
];

export const mockViolations = [
  {
    id: '1',
    type: 'tab-switch',
    timestamp: '2024-01-15T10:45:00Z',
    description: 'Student switched to another tab',
    evidence: 'Browser tab change detected',
    severity: 'high'
  },
  {
    id: '2',
    type: 'face-not-detected',
    timestamp: '2024-01-15T10:50:00Z',
    description: 'Face not visible in camera feed',
    evidence: 'Camera feed analysis',
    severity: 'medium'
  }
];

export const mockResults = [
  {
    id: '1',
    userId: '1',
    examId: '1',
    score: 85,
    totalScore: 100,
    violations: mockViolations,
    startTime: '2024-01-15T10:30:00Z',
    endTime: '2024-01-15T12:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    userId: '2',
    examId: '1',
    score: 92,
    totalScore: 100,
    violations: [],
    startTime: '2024-01-15T10:30:00Z',
    endTime: '2024-01-15T12:15:00Z',
    status: 'completed'
  }
];
