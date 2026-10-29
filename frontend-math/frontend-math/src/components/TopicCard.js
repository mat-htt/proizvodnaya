import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { splitLectureTitle } from '../utils/format';

const TopicCard = ({ slug, title, image, hasTest, index }) => {
  const { num, title: cleanTitle } = splitLectureTitle(title);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link to={`/topic/${slug}`} className="topic-card">
      <div className="topic-card__top">
        <span className="topic-card__num">{num || index + 1}</span>
        {hasTest && <span className="badge badge--brand">Есть тест</span>}
      </div>
      <h3>{cleanTitle}</h3>
      <div className="topic-card__media">
        {image && !imgFailed
          ? <img src={image} alt="" loading="lazy" onError={() => setImgFailed(true)} />
          : <span className="topic-card__placeholder">f′(x)</span>}
      </div>
    </Link>
  );
};

export default TopicCard;
