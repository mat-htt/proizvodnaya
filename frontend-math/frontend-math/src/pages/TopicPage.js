import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { renderMath } from '../utils/math';
import { splitLectureTitle } from '../utils/format';
import { ArrowLeft, ArrowRight } from '../components/Icons';
import '../css/TopicPage.css';

// youtube.com/watch?v=ID и youtu.be/ID → адрес для встраивания
const toEmbedUrl = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const TopicPage = () => {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.get(`/lectures/${slug}/`), api.get('/lectures/')])
      .then(([one, all]) => {
        setTopic(one.data);
        setLectures(all.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки лекции:', err);
        setError(err.response?.status === 404 ? 'Лекция не найдена' : 'Не удалось загрузить лекцию. Проверьте, что сервер запущен.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // HTML лекции вставляем сами, а не через dangerouslySetInnerHTML:
  // так React не затрёт формулы, которые отрисовал KaTeX
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !topic) return;
    el.innerHTML = topic.content || '';
    renderMath(el);
  }, [topic, loading]);

  // Индикатор прочитанного
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(total, 1))));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [topic, loading]);

  if (loading) return <div className="state"><div className="spinner" />Загружаем лекцию…</div>;
  if (error) return <div className="state"><h3>{error}</h3><Link to="/" className="btn">К программе курса</Link></div>;

  const index = lectures.findIndex(l => l.slug === slug);
  const prev = index > 0 ? lectures[index - 1] : null;
  const next = index >= 0 && index < lectures.length - 1 ? lectures[index + 1] : null;
  const { num, title } = splitLectureTitle(topic.title);

  return (
    <article className="lecture">
      <div className="lecture__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <header className="lecture__head">
        <div className="container container--narrow">
          <nav className="crumbs" aria-label="Навигация">
            <Link to="/">Курс</Link>
            <span>/</span>
            <span>Лекция {num || index + 1}</span>
          </nav>
          <h1 className="lecture__title">{title}</h1>
          <div className="lecture__meta">
            {index >= 0 && <span className="badge">Лекция {index + 1} из {lectures.length}</span>}
            {topic.related_test && <span className="badge badge--brand">К лекции есть тест</span>}
          </div>
        </div>
      </header>

      <div className="container container--narrow">
        {topic.video_url && (
          <div className="lecture__video">
            <iframe
              src={toEmbedUrl(topic.video_url)}
              title={`Видео: ${title}`}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div ref={contentRef} className="lecture-content" />

        {topic.related_test && (
          <div className="lecture__test">
            <div>
              <h3>Проверьте себя</h3>
              <p>Короткий тест по этой лекции, результат — сразу после отправки.</p>
            </div>
            <Link to={`/quiz/${topic.related_test}`} className="btn btn--primary btn--lg">
              Пройти тест <ArrowRight size={18} />
            </Link>
          </div>
        )}

        <nav className="lecture__pager" aria-label="Соседние лекции">
          {prev ? (
            <Link to={`/topic/${prev.slug}`} className="pager-link">
              <span><ArrowLeft size={16} /> Предыдущая</span>
              <strong>{splitLectureTitle(prev.title).title}</strong>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/topic/${next.slug}`} className="pager-link pager-link--next">
              <span>Следующая <ArrowRight size={16} /></span>
              <strong>{splitLectureTitle(next.title).title}</strong>
            </Link>
          ) : (
            <Link to="/tests" className="pager-link pager-link--next">
              <span>Финиш <ArrowRight size={16} /></span>
              <strong>Итоговое тестирование</strong>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
};

export default TopicPage;
