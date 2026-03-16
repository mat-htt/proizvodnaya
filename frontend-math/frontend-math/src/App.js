import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Header from './components/Header';
import Footer from './components/Footer';
import Hub from './pages/Hub';
import QuizPage from './pages/QuizPage';
import TopicPage from './pages/TopicPage';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('access_token') ? children : <Navigate to="/login" />;
};

function App() {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error("Ошибка при загрузке лекций:", err));
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Hub lectures={lectures} />} />
            <Route path="/topic/:slug" element={<TopicPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Защищенные маршруты */}
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