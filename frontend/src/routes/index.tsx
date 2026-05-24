import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';

import { SchoolsPage } from '../features/schools/pages/SchoolsPage';
import { ClassesPage } from '../features/academic-classes/pages/ClassesPage';
import { SubjectsPage } from '../features/subjects/pages/SubjectsPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { TeachersPage } from '../features/teachers/pages/TeachersPage';
import { StudentsPage } from '../features/students/pages/StudentsPage';
import { NoticesPage } from '../features/notices/pages/NoticesPage';
import { ComplainsPage } from '../features/complains/pages/ComplainsPage';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { TeacherDashboard } from '../features/teacher/pages/TeacherDashboard';
import { MySubjectsPage } from '../features/teacher/pages/MySubjectsPage';
import { MyClassesPage } from '../features/teacher/pages/MyClassesPage';

import { StudentLayout } from '../layouts/StudentLayout';
import { StudentDashboard } from '../features/student/pages/StudentDashboard';
import { MyNoticesPage } from '../features/student/pages/MyNoticesPage';
import { MyComplainsPage } from '../features/student/pages/MyComplainsPage';

import { PublicRoute } from './PublicRoute';
import { AdminDashboard } from '../features/admin/pages/AdminDashboard';
import { LandingPage } from '@/features/landing/pages/LandingPage';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

const Unauthorized = () => <div>403 Unauthorized</div>;
const NotFound = () => <div>404 Not Found</div>;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="complains" element={<ComplainsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="subjects" element={<MySubjectsPage />} />
          <Route path="classes" element={<MyClassesPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="notices" element={<MyNoticesPage />} />
          <Route path="complaints" element={<MyComplainsPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
