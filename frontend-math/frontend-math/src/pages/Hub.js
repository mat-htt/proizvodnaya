import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopicCard from '../components/TopicCard';
import '../css/Hub.css';

const Hub = () => {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  return (
    <div className="hub-container">
      <h2 className="hub-title">Курс по производным</h2>
      <div className="hub-grid">
        {lectures.map(l => (
          <TopicCard
            key={l.id}
            slug={l.slug}
            title={l.title}
            image={l.image_url}
          />
        ))}
      </div>
    </div>
  );
};
export default Hub;