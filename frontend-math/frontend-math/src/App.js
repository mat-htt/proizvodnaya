import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Общие компоненты
import Header from './components/Header';
import Footer from './components/Footer';

// Страницы
import Hub from './pages/Hub';
import QuizPage from './pages/QuizPage';
import TopicPage from './pages/TopicPage'; // Наш новый универсальный компонент

function App() {
  const [lectures, setLectures] = useState([]);

  // Загружаем список лекций один раз при старте приложения для главной страницы (Hub)
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
            {/* Главная страница со всеми темами */}
            <Route path="/" element={<Hub lectures={lectures} />} />

            {/* Универсальный роут для тем.
              Параметр :slug позволяет открывать любую лекцию
              (например, /topic/opredelenie-proizvodnoy) используя один компонент.
            */}
            <Route path="/topic/:slug" element={<TopicPage />} />

            {/* Страница теста по его ID */}
            <Route path="/quiz/:id" element={<QuizPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;