import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/TopicPage.css';

const TopicPage = () => {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/lectures/${slug}/`);
        setTopic(res.data);
      } catch (err) {
        console.error('Ошибка загрузки лекции:', err);
        setError('Не удалось загрузить лекцию. Проверьте сервер.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [slug]);

  // Рендерим KaTeX после загрузки контента
  useEffect(() => {
    if (topic) {
      const timer = setTimeout(() => {
        const contentElement = document.querySelector('.lecture-content');
        if (contentElement && window.renderMathInElement) {
          window.renderMathInElement(contentElement, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false }
            ]
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [topic]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
  if (error) return <div className="container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;
  if (!topic) return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Тема не найдена</div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{topic.title}</h1>



      {/* Видео-плеер */}
      {topic.video_url && (
        <div style={{ marginBottom: '20px' }}>
          <iframe
            width="100%"
            height="450"
            src={topic.video_url.replace("watch?v=", "embed/")}
            title="Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* HTML-контент */}
      <div
        className="lecture-content"
        dangerouslySetInnerHTML={{ __html: topic.content }}
      />

      {/* Кнопка теста */}
      {topic.related_test && (
        <div style={{ textAlign: 'center', margin: '3.5rem 0' }}>
          <Link
            to={`/quiz/${topic.related_test}`}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '14px 40px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '1.25rem',
              fontWeight: 600,
              display: 'inline-block',
              boxShadow: '0 6px 20px rgba(16,185,129,0.3)'
            }}
          >
            Пройти тест по теме →
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopicPage;