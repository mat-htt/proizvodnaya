import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { MathText } from '../utils/math';
import { scoreTone } from '../utils/format';
import { ArrowLeft } from '../components/Icons';
import '../css/TestStats.css';

// Статистика по задачам теста: где ученики ошибаются чаще всего
const TestStats = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [sortByDifficulty, setSortByDifficulty] = useState(false);

  useEffect(() => {
    api.get(`/tests/${id}/stats/`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.status === 403 ? 'Раздел доступен только учителям' : 'Не удалось загрузить статистику'));
  }, [id]);

  const questions = useMemo(() => {
    if (!data) return [];
    const list = [...data.questions];
    return sortByDifficulty ? list.sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101)) : list;
  }, [data, sortByDifficulty]);

  if (error) return <div className="state"><h3>{error}</h3><Link to="/manage-tests" className="btn">К тестам</Link></div>;
  if (!data) return <div className="state"><div className="spinner" />Считаем статистику…</div>;

  const hardest = data.attempts
    ? data.questions.reduce((min, q) => (q.rate < min.rate ? q : min), data.questions[0])
    : null;

  return (
    <div className="page">
      <div className="container">
        <Link to="/manage-tests" className="back-link"><ArrowLeft size={16} /> Все тесты</Link>
        <header className="page-head">
          <h1 className="page-title">{data.title}</h1>
          <p className="page-lead">Какую долю учеников каждая задача «пропустила» — и какие неправильные ответы встречаются чаще всего.</p>
        </header>

        <div className="stat-grid">
          <div className="stat"><div className="stat__label">Попыток</div><div className="stat__value">{data.attempts}</div></div>
          <div className="stat"><div className="stat__label">Средний балл</div><div className="stat__value">{data.average}%</div></div>
          <div className="stat">
            <div className="stat__label">Самая трудная задача</div>
            <div className="stat__value">{hardest ? `№${hardest.number}` : '—'}</div>
            {hardest && <div className="stat__note">решили {hardest.rate}%</div>}
          </div>
        </div>

        {data.attempts === 0 ? (
          <div className="state card stats__empty">
            <h3>Тест ещё никто не проходил</h3>
            <p>Статистика появится после первых попыток.</p>
          </div>
        ) : (
          <>
            <div className="stats__toolbar">
              <h2 className="section-title">Задачи</h2>
              <div className="segmented" role="radiogroup" aria-label="Порядок">
                <button className={!sortByDifficulty ? 'is-active' : ''} onClick={() => setSortByDifficulty(false)}>По порядку</button>
                <button className={sortByDifficulty ? 'is-active' : ''} onClick={() => setSortByDifficulty(true)}>Сначала трудные</button>
              </div>
            </div>

            <ol className="stats__list">
              {questions.map(q => {
                const tone = scoreTone(q.rate);
                return (
                  <li key={q.id} className="stats__item">
                    <div className="stats__rate">
                      <strong className={`stats__percent stats__percent--${tone}`}>{q.rate}%</strong>
                      <span>решили</span>
                    </div>
                    <div className="stats__body">
                      <span className="stats__num">Задача {q.number}</span>
                      <MathText as="p" className="stats__text" text={q.text} />
                      <div className="stats__bar" aria-hidden="true">
                        <span className={`stats__fill stats__fill--${tone}`} style={{ width: `${q.rate}%` }} />
                      </div>
                      <div className="stats__meta">
                        <span>Верно: <b>{q.correct}</b></span>
                        <span>Ошиблись: <b>{q.answered - q.correct}</b></span>
                        <span>Пропустили: <b>{q.skipped}</b></span>
                        <span>Ответ: <b>{q.correct_answer || '—'}</b></span>
                      </div>
                      {q.common_wrong.length > 0 && (
                        <div className="stats__wrong">
                          <span>Частые ошибки:</span>
                          {q.common_wrong.map(w => (
                            <span key={w.answer} className="badge badge--bad">{w.answer} · {w.count}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
};

export default TestStats;
