import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';

// Страницы
import Hub from './pages/Hub';
import QuizPage from './pages/QuizPage';

// Лекции (Проверь, чтобы пути и названия файлов совпадали!)
import Topic1 from './pages/topics/Topic1';
import Topic2 from './pages/topics/Topic2'; // Вот этой строки у тебя, скорее всего, не было
import Topic3 from './pages/topics/Topic3';
import Topic4 from './pages/topics/Topic4';
import Topic5 from './pages/topics/Topic5';

function App() {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error("Ошибка при загрузке лекций:", err));
  }, []);

  // Функция для поиска данных конкретной лекции из массива, пришедшего с бэкенда
  const getLectureData = (id) => lectures.find(l => l.id === id) || {};

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Hub />} />

            {/* Передаем данные из БД в каждую лекцию через пропс data */}
            <Route path="/topic/1" element={<Topic1 data={getLectureData(1)} />} />
            <Route path="/topic/2" element={<Topic2 data={getLectureData(2)} />} />
            <Route path="/topic/3" element={<Topic3 data={getLectureData(3)} />} />
            <Route path="/topic/4" element={<Topic4 data={getLectureData(4)} />} />
            <Route path="/topic/5" element={<Topic5 data={getLectureData(5)} />} />

            <Route path="/quiz/:id" element={<QuizPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;