import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import api from './api';

import Header from './components/Header';
import Footer from './components/Footer';
import Hub from './pages/Hub';
import QuizPage from './pages/QuizPage';
import TopicPage from './pages/TopicPage';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Resources from './pages/Resources';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('access_token') ? children : <Navigate to="/login" />;
};

function App() {
  const [lectures, setLectures] = useState([]);
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
        localStorage.clear();
        setUser({ isLoggedIn: false, isTeacher: false, username: '' });
      }
    } else {
      setUser({ isLoggedIn: false, isTeacher: false, username: '' });
    }
  };

  useEffect(() => {
    // Загрузка лекций
    axios.get('http://127.0.0.1:8000/api/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error(err));

    refreshAuth();
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header user={user} onLogout={refreshAuth} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Hub lectures={lectures} />} />
            <Route path="/topic/:slug" element={<TopicPage />} />
            <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/quiz/:id" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
            <Route path="/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;