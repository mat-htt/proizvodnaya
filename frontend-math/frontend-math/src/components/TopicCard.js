import React from 'react';
import { Link } from 'react-router-dom';
import '../css/TopicCard.css';

// Теперь принимаем slug вместо id
const TopicCard = ({ slug, title, image }) => {
  return (
    <Link to={`/topic/${slug}`} className="topic-card">
      <img src={image} alt={title} className="topic-card-img" />
      <div className="topic-card-body">
        <h3 className="topic-card-title">{title}</h3>
      </div>
    </Link>
  );
};

export default TopicCard;