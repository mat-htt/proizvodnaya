import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TopicPage = () => {
  const { slug } = useParams(); // Берем название темы из URL
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ищем конкретную лекцию по её slug
    axios.get(`http://127.0.0.1:8000/api/lectures/?slug=${slug}`)
      .then(res => {
        // DRF обычно возвращает список, берем первый элемент
        const data = Array.isArray(res.data) ? res.data.find(l => l.slug === slug) : res.data;
        setTopic(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки темы:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="container">Загрузка...</div>;
  if (!topic) return <div className="container">Тема не найдена</div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{topic.title}</h1>

      {/* Отображаем видео, если есть ссылка */}
      {topic.video_url && (
        <div style={{ marginBottom: '20px' }}>
          <iframe
            width="100%"
            height="450"
            src={topic.video_url.replace("watch?v=", "embed/")}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Выводим наш HTML-контент из базы */}
      <div
        className="lecture-content"
        dangerouslySetInnerHTML={{ __html: topic.content }}
      />

      {/* Кнопка перехода к тесту */}
      {topic.related_test && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to={`/quiz/${topic.related_test}`} className="btn btn-primary">
            Перейти к тесту по теме
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopicPage;