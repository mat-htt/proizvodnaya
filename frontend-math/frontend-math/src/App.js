import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';
import { ToastProvider } from './components/Toast';

import Header from './components/Header';
import Footer from './components/Footer';
import Hub from './pages/Hub';
import QuizPage from './pages/QuizPage';
import TopicPage from './pages/TopicPage';
import TestsPage from './pages/TestsPage';
import MyResults from './pages/MyResults';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Resources from './pages/Resources';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import CreateTest from './pages/CreateTest';
import ManageTests from './pages/ManageTests';
import EditTest from './pages/EditTest';
import TestStats from './pages/TestStats';
import LivePage from './pages/LivePage';
import StartQuiz from './pages/StartQuiz';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  return localStorage.getItem('access_token')
    ? children
    : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
};

// При переходе между страницами прокручиваем наверх
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    isTeacher: false,
    username: ''
  });

  // Функция для обновления данных пользователя (вызывается при загрузке и после Login)
  const refreshAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const res = await api.get('/me/');
        setUser({
          isLoggedIn: true,
          isTeacher: res.data.is_teacher,
          username: res.data.username || 'Пользователь'
        });
      } catch (err) {
        console.error("Сессия истекла");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser({ isLoggedIn: false, isTeacher: false, username: '' });
      }
    } else {
      setUser({ isLoggedIn: false, isTeacher: false, username: '' });
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <div className="app-shell">
          <Header user={user} onLogout={refreshAuth} />

          <main className="app-main">
            <Routes>
              <Route path="/" element={<Hub user={user} />} />
              <Route path="/topic/:slug" element={<TopicPage />} />
              <Route path="/tests" element={<TestsPage user={user} />} />
              <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-results" element={<PrivateRoute><MyResults /></PrivateRoute>} />
              <Route path="/create-test" element={<PrivateRoute><CreateTest /></PrivateRoute>} />
              <Route path="/manage-tests" element={<PrivateRoute><ManageTests /></PrivateRoute>} />
              <Route path="/edit-test/:id" element={<PrivateRoute><EditTest /></PrivateRoute>} />

              <Route path="/quiz/:id" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
              <Route path="/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />
              <Route path="/test-stats/:id" element={<PrivateRoute><TestStats /></PrivateRoute>} />
              <Route path="/live" element={<PrivateRoute><LivePage /></PrivateRoute>} />
              <Route path="/start" element={<PrivateRoute><StartQuiz /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
