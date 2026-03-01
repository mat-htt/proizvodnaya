import React from 'react';
import { Link } from 'react-router-dom';

const Topic1 = ({ data }) => {
  // data содержит: title, related_test, image_url и т.д.

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* Название теперь динамическое из БД! */}
      <h1 style={{ color: '#2e7d32' }}>{data.title || "Загрузка..."}</h1>

      <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
        <p>Здесь твой фиксированный текст лекции №1...</p>
      </div>

      {/* Если в БД привязан тест, показываем кнопку */}
      {data.related_test && (
        <div style={{ marginTop: '50px', textAlign: 'center', padding: '30px', background: '#f9f9f9', borderRadius: '15px' }}>
          <h3>Готовы проверить знания по теме "{data.title}"?</h3>
          <Link to={`/quiz/${data.related_test}`}>
            <button style={{
              background: '#2e7d32', color: 'white', padding: '15px 40px',
              border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '18px'
            }}>
              Начать тест →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Topic1;