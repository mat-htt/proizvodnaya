import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/TeacherDashboard.css';

const TeacherDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [testFilter, setTestFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results/');
        setResults(res.data);
      } catch (err) {
        console.error('Ошибка загрузки результатов:', err);
        if (err.response?.status === 403) {
          alert('Доступ только для учителей');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const openDetails = async (id) => {
    try {
      // ИСПРАВЛЕНО: Убран лишний слэш в конце URL
      const res = await api.get(`/submission/${id}/`);

      // Находим строку в таблице, чтобы взять оттуда имя/ник
      const tableRow = results.find(r => r.id === id);

      // Добавляем display_name вручную в объект ответа
      setSelectedSubmission({
        ...res.data,
        display_name: (res.data.student_name && res.data.student_name !== "—")
          ? res.data.student_name
          : (tableRow?.student_name || "Ученик")
      });
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить детали теста');
    }
  };

  const closeDetails = () => setSelectedSubmission(null);

  // Рендерим KaTeX в модалке после открытия
  useEffect(() => {
    if (selectedSubmission) {
      const timer = setTimeout(() => {
        const content = document.querySelector('.modal-content');
        if (content && window.renderMathInElement) {
          window.renderMathInElement(content, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true },
            ],
            throwOnError: false,
            errorColor: '#ef4444',
            strict: 'ignore',
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedSubmission]);

  const deleteResult = async (id) => {
    if (!window.confirm('Удалить результат навсегда?')) return;

    try {
      await api.delete(`/submission/${id}/`);
      setResults(results.filter(r => r.id !== id));
      alert('Результат удалён');
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const filteredResults = results.filter(res =>
    res.student_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (testFilter === "" || res.test_title === testFilter)
  );

  const uniqueTests = [...new Set(results.map(r => r.test_title))];

  if (loading) return <div className="loading">Загрузка результатов...</div>;

  return (
    <div className="page-container">
      <h2 className="dashboard-title">Мониторинг успеваемости</h2>

      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="Поиск по ученику..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select
          value={testFilter}
          onChange={e => setTestFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все тесты</option>
          {uniqueTests.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>Ученик</th>
            <th>Группа</th>
            <th>Тест</th>
            <th>Результат</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-results">
                Результаты не найдены
              </td>
            </tr>
          ) : (
            filteredResults.map(res => (
              <tr
                key={res.id}
                onClick={() => openDetails(res.id)}
                className="clickable-row"
              >
                <td>{res.student_name}</td>
                <td>{res.group_name || '—'}</td>
                <td>{res.test_title}</td>
                <td className={res.score >= 60 ? "score-pass" : "score-fail"}>
                  {res.score}%
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResult(res.id);
                    }}
                    className="delete-btn"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedSubmission && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetails}>×</button>

            <h3 className="modal-title">{selectedSubmission.test_title}</h3>
            <div className="modal-info">
              {/* Теперь поле display_name существует в объекте стейта */}
              <p><strong>Ученик:</strong> {selectedSubmission.display_name}</p>
              <p><strong>Группа:</strong> {selectedSubmission.group_name || 'без группы'}</p>
              <p><strong>Результат:</strong> <span className={selectedSubmission.score >= 60 ? "score-pass" : "score-fail"}>{selectedSubmission.score}%</span></p>
            </div>

            <div className="responses-list">
              {selectedSubmission.responses?.length > 0 ? (
                selectedSubmission.responses.map((resp, index) => (
                  <div
                    key={index}
                    className={`response-item ${resp.is_correct ? 'correct' : 'incorrect'}`}
                  >
                    <p className="question-text">{resp.question_text}</p>

                    <div className="answer-block">
                      <p><strong>Ответ ученика:</strong> {resp.user_answer || '—'}</p>
                      <p><strong>Правильный ответ:</strong> {resp.correct_answer || '—'}</p>
                    </div>

                    <p className="status">
                      {resp.is_correct ? 'Правильно ✓' : 'Неправильно ✗'}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                  Детали ответов пока не загружены
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;