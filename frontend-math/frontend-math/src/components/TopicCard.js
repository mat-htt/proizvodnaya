import React from 'react';
import { Link } from 'react-router-dom';

const TopicCard = ({ id, title, image }) => {
  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: '#333',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column'
  };

  const imageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover', // Картинка заполнит область без искажений
    background: '#e8f5e9'
  };

  return (
    <Link to={`/topic/${id}`} style={cardStyle} className="topic-card">
      <img src={image} alt={title} style={imageStyle} />
      <div style={{ padding: '15px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, color: '#2e7d32' }}>{title}</h3>
      </div>
    </Link>
  );
};

export default TopicCard;