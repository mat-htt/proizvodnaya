import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { formatDate, scoreTone } from '../utils/format';
import { ArrowRight } from '../components/Icons';
import '../css/Tests.css';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-results/')
      .then(res => setResults(res.data))
      .catch(err => console.error('Ошибка загрузки результатов:', err))
      .finally(() => setLoading(false));
  }, []);

  const attempts = results.length;
  const avg = attempts ? Math.round(results.reduce((s, r) => s + r.score, 0) / attempts) : 0;
  const best = attempts ? Math.max(...results.map(r => r.score)) : 0;
  const passed = new Set(results.filter(r => r.score >= 60).map(r => r.test)).size;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <h1 className="page-title">Мои результаты</h1>
          <p className="page-lead">История всех попыток. Тест считается сданным при результате от 60%.</p>
        </header>

        {loading ? (
          <div className="state"><div className="spinner" /></div>
        ) : attempts === 0 ? (
          <div className="state card">
            <h3>Вы ещё не проходили тесты</h3>
            <p>Начните с итогового тестирования или теста к любой лекции.</p>
            <Link to="/tests" className="btn btn--primary">К тестам <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat"><div className="stat__label">Попыток</div><div className="stat__value">{attempts}</div></div>
              <div className="stat"><div className="stat__label">Средний результат</div><div className="stat__value">{avg}%</div></div>
              <div className="stat"><div className="stat__label">Лучший результат</div><div className="stat__value">{best}%</div></div>
              <div className="stat"><div className="stat__label">Сдано тестов</div><div className="stat__value">{passed}</div><div className="stat__note">с результатом ≥ 60%</div></div>
            </div>

            <div className="table-wrap results-block">
              <table className="table">
                <thead>
                  <tr><th>Тест</th><th>Дата</th><th>Результат</th><th /></tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id}>
                      <td>{r.test_title}</td>
                      <td style={{ color: 'var(--muted)' }}>{formatDate(r.submitted_at)}</td>
                      <td><span className={`score score--${scoreTone(r.score)}`}>{r.score}%</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/quiz/${r.test}`} className="btn btn--ghost btn--sm">Ещё раз</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyResults;
