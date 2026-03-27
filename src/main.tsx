import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';

// Layouts
import { MainLayout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { StudentHome } from './pages/StudentHome';
import { LessonList } from './pages/app/LessonList';
import { LessonDetail } from './pages/app/LessonDetail';
import { AIChat } from './modules/ai-chat/ChatWindow';
import { HeritageGenerator } from './modules/heritage-generator/PromptInput';
import { LearningGames } from './pages/app/LearningGames';
import { QuizGame } from './modules/learning-games/QuizGame';
import { StudentAnnouncements } from './pages/app/Announcements';
import { ProfileAndAchievements } from './pages/app/ProfileAndAchievements';
import { DigitalHeritage } from './pages/app/DigitalHeritage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnnouncements } from './pages/admin/Announcements';
import { ClassManagement } from './pages/admin/ClassManagement';
import { StudentManagement } from './pages/admin/StudentManagement';
import { LessonManagement } from './pages/admin/LessonManagement';
import { QuestionBankManagement } from './pages/admin/QuestionBankManagement';
import { HeritageManagement } from './pages/admin/HeritageManagement';
import { AdminReports } from './pages/admin/Reports';
import { AssignmentManagement } from './pages/admin/AssignmentManagement';
import { GameManagement } from './pages/admin/GameManagement';
import { Gradebook } from './pages/admin/Gradebook';
import { StudentAssignments } from './pages/app/StudentAssignments';
import { SubmitAssignment } from './pages/app/SubmitAssignment';

// Auth Pages
import { Login } from './pages/auth/Login';

import { dataProvider } from './core/provider';
import { User } from './core/types';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await dataProvider.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'student' ? '/app/home' : '/admin/dashboard'} replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout role="app" />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'home', element: <StudentHome /> },
      { path: 'lessons', element: <LessonList /> },
      { path: 'lessons/:lessonId', element: <LessonDetail /> },
      { path: 'digital-heritage', element: <DigitalHeritage /> },
      { path: 'heritages', element: <Navigate to="/app/digital-heritage" replace /> },
      { path: 'ai-chat', element: <Navigate to="/app/digital-heritage" replace /> },
      { path: 'games', element: <LearningGames /> },
      { path: 'games/quiz/:quizId', element: <QuizGame /> },
      { path: 'announcements', element: <StudentAnnouncements /> },
      { path: 'assignments', element: <StudentAssignments /> },
      { path: 'assignments/:assignmentId', element: <SubmitAssignment /> },
      { path: 'profile', element: <ProfileAndAchievements /> },
      { path: 'grades', element: <Navigate to="/app/profile" replace /> },
      { path: 'progress', element: <Navigate to="/app/profile" replace /> },
      { path: 'achievements', element: <Navigate to="/app/profile" replace /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['teacher', 'admin']}>
        <MainLayout role="admin" />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'classes', element: <ClassManagement /> },
      { path: 'students', element: <StudentManagement /> },
      { path: 'lessons', element: <LessonManagement /> },
      { path: 'questions', element: <QuestionBankManagement /> },
      { path: 'heritage', element: <HeritageManagement initialTab="heritages" /> },
      { path: 'assignments', element: <AssignmentManagement /> },
      { path: 'games', element: <GameManagement /> },
      { path: 'gradebook', element: <Gradebook /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'reports', element: <AdminReports /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors />
  </StrictMode>,
);
