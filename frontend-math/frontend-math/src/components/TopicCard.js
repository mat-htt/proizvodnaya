import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { splitLectureTitle } from '../utils/format';
import { ArrowRight } from './Icons';

const DEFAULT_COVER = '/images/covers/default.svg';

const TopicCard = ({ slug, title, image, hasTest, index }) => {
  const { num, title: cleanTitle } = splitLectureTitle(title);
  const [imgFailed, setImgFailed] = useState(false);
  const cover = !image || imgFailed ? DEFAULT_COVER : image;

  return (
    <Link to={`/topic/${slug}`} className="topic-card reveal spotlight" style={{ '--reveal-delay': `${(index % 3) * 80}ms` }}>
      <div className="topic-card__media">
        <img src={cover} alt="" loading="lazy" onError={() => setImgFailed(true)} />
        <span className="topic-card__num">{num || index + 1}</span>
      </div>
      <div className="topic-card__body">
        <h3>{cleanTitle}</h3>
        <div className="topic-card__foot">
          {hasTest ? <span className="badge badge--brand">Есть тест</span> : <span className="badge">Лекция</span>}
          <span className="round-arrow"><ArrowRight size={16} /></span>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
