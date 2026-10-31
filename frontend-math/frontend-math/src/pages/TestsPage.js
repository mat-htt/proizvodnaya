import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Shuffle, Book } from '../components/Icons';
import { plural, scoreTone } from '../utils/format';
import '../css/Tests.css';

const TestsPage = ({ user }) => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [best, setBest] = useState({});
  const [loading, setLoading] = useState(true);
  const isLoggedIn = Boolean(localStorage.getItem('access_token'));

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([api.get('/tests/'), api.get('/my-results/')])
      .then(([testsRes, resultsRes]) => {
        setTests(testsRes.data);
        // Лучший результат ученика по каждому тесту
        const map = {};
        resultsRes.data.forEach(r => { map[r.test] = Math.max(map[r.test] ?? 0, r.score); });
        setBest(map);
      })
      .catch(err => console.error('Ошибка загрузки тестов:', err))
      .finally(() => setLoading(false));
  }, [isLoggedIn, user.isLoggedIn]);

  // Варианты одного тестирования собираем в серию, остальные — отдельные тесты
  const { series, single } = useMemo(() => {
    const groups = {};
    const rest = [];
    tests.forEach(t => {
      if (t.series) (groups[t.series] = groups[t.series] || []).push(t);
      else rest.push(t);
    });
    return { series: Object.entries(groups), single: rest };
  }, [tests]);

  const randomVariant = (variants) => {
    const pick = variants[Math.floor(Math.random() * variants.length)];
    navigate(`/quiz/${pick.id}`);
  };

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <h1 className="page-title">Тесты</h1>
          <p className="page-lead">
            Выберите вариант итогового тестирования или тест к конкретной лекции. Ответы проверяются автоматически,
            а разбор ошибок появится сразу после отправки.
          </p>
        </header>

        {!isLoggedIn ? (
          <div className="card card--pad tests-gate">
            <div>
              <h3>Войдите, чтобы проходить тесты</h3>
              <p>Результаты сохраняются в вашем профиле, а учитель видит успеваемость группы.</p>
            </div>
            <div className="tests-gate__actions">
              <Link to="/login" state={{ from: '/tests' }} className="btn">Войти</Link>
              <Link to="/register" className="btn btn--primary">Регистрация</Link>
            </div>
          </div>
        ) : loading ? (
          <div className="tests-grid">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
          </div>
        ) : (
          <>
            {series.map(([name, variants]) => {
              const questionCount = variants[0]?.question_count || 0;
              return (
                <section key={name} className="series">
                  <div className="series__info">
                    <span className="tag">Итоговое тестирование</span>
                    <h2>{name}</h2>
                    <p>{variants[0]?.description}</p>
                    <ul className="series__facts">
                      <li><strong>{variants.length}</strong> {plural(variants.length, 'вариант', 'варианта', 'вариантов')}</li>
                      <li><strong>{questionCount}</strong> {plural(questionCount, 'задача', 'задачи', 'задач')} в каждом</li>
                      <li>Открытый ответ</li>
                    </ul>
                    <button className="btn btn--primary btn--lg" onClick={() => randomVariant(variants)}>
                      <Shuffle size={18} /> Получить случайный вариант
                    </button>
                  </div>

                  <div className="series__variants">
                    {variants.map(v => (
                      <Link key={v.id} to={`/quiz/${v.id}`} className="variant spotlight">
                        <span className="variant__label">Вариант</span>
                        <span className="variant__num">{v.variant ?? '—'}</span>
                        {best[v.id] !== undefined
                          ? <span className={`badge badge--${scoreTone(best[v.id])}`}>Лучший: {best[v.id]}%</span>
                          : <span className="variant__go">Начать <ArrowRight size={14} /></span>}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            {single.length > 0 && (
              <section className="tests-section">
                <h2 className="section-title">Тесты к лекциям</h2>
                <div className="tests-grid">
                  {single.map(t => (
                    <Link key={t.id} to={`/quiz/${t.id}`} className="test-card spotlight">
                      <div className="test-card__top">
                        <span className="badge">{t.question_count} {plural(t.question_count, 'вопрос', 'вопроса', 'вопросов')}</span>
                        {best[t.id] !== undefined && <span className={`badge badge--${scoreTone(best[t.id])}`}>{best[t.id]}%</span>}
                      </div>
                      <h3>{t.title.replace(/[«»]/g, '')}</h3>
                      {t.lecture && <p className="test-card__lecture"><Book size={14} /> {t.lecture.title}</p>}
                      <span className="test-card__go">Пройти тест <ArrowRight size={16} /></span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {tests.length === 0 && (
              <div className="state card">
                <h3>Тестов пока нет</h3>
                <p>Учитель ещё не опубликовал ни одного теста.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestsPage;
