// import React, { useState } from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import LoginPage from './components/LoginPage';
// import DashboardLayout from './components/DashboardLayout';
// import Dashboard from './components/Dashboard';
// import UserManagement from './components/UserManagement';
// import ExamManagement from './components/ExamManagement';
// import ResultsManagement from './components/ResultsManagement';
// import UserLoginPage from './components/user/LoginPage';

// const AppContent = () => {
//   const { admin, loading } = useAuth();
//   const [activeTab, setActiveTab] = useState('dashboard');

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!admin) {
//     return <LoginPage />;
//   }

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'users':
//         return <UserManagement />;
//       case 'exams':
//         return <ExamManagement />;
//       case 'results':
//         return <ResultsManagement />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
//       {renderContent()}
//     </DashboardLayout>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';        // Admin
import { UserAuthProvider } from './contexts/UserAuthContext';          // User

import LoginPage from './components/LoginPage';         // Admin login
import UserLoginPage from './components/user/LoginPage'; // User login

import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ExamManagement from './components/ExamManagement';
import ResultsManagement from './components/ResultsManagement';
import Exam from './components/user/exam';

const RequireAdminAuth = ({ children }) => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoutes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'results':
        return <ResultsManagement />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Admin routes wrapped in AuthProvider */}
        <Route
          path="/admin/*"
          element={
            <AuthProvider>
              <RequireAdminAuth>
                <AdminRoutes />
              </RequireAdminAuth>
            </AuthProvider>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AuthProvider>
              <LoginPage />
            </AuthProvider>
          }
        />

        {/* User routes wrapped in UserAuthProvider */}
        <Route
          path="/login"
          element={
            <UserAuthProvider>
              <UserLoginPage />
            </UserAuthProvider>
          }
        />
        {/* Add more user protected routes here wrapped in UserAuthProvider */}

        {/* Redirect root to user login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all - redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/exam" element={<Exam/>} />
      </Routes>
    </Router>
  );
};

export default App;

