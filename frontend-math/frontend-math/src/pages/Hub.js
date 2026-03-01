import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Hub = () => {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    // Тянем лекции из новой таблицы бэкенда
    axios.get('http://127.0.0.1:8000/api/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error("Ошибка загрузки лекций:", err));
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#2e7d32', marginBottom: '30px', textAlign: 'center' }}>Курс по производным</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px'
      }}>
        {lectures.map(lecture => (
          <Link
            to={`/topic/${lecture.id}`}
            key={lecture.id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Картинка из БД или дефолтная */}
              <img
                src={lecture.image_url || "/images/default.jpg"}
                alt={lecture.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>{lecture.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666' }}>
                  <span>{lecture.related_test ? "✅ Тест доступен" : "⏳ Тест в разработке"}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Hub;