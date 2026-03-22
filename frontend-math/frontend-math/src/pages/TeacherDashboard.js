import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/TeacherDashboard.css';

const TeacherDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [testFilter, setTestFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState(""); // Фильтр по группам
  const [scoreRangeFilter, setScoreRangeFilter] = useState(""); // Фильтр по %
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
      const res = await api.get(`/submission/${id}/`);
      const tableRow = results.find(r => r.id === id);

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

  // Логика фильтрации
  const filteredResults = results.filter(res => {
    const matchesSearch = res.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTest = testFilter === "" || res.test_title === testFilter;
    const matchesGroup = groupFilter === "" || res.group_name === groupFilter;

    // Фильтр по диапазону процентов (например, "20-30")
    let matchesScore = true;
    if (scoreRangeFilter !== "") {
      const [min, max] = scoreRangeFilter.split('-').map(Number);
      matchesScore = res.score >= min && res.score < max;
    }

    return matchesSearch && matchesTest && matchesGroup && matchesScore;
  });

  const uniqueTests = [...new Set(results.map(r => r.test_title))];
  const uniqueGroups = [...new Set(results.map(r => r.group_name).filter(Boolean))];

  // Генерируем интервалы для селекта (0-10, 10-20 ... 90-101)
  const scoreRanges = Array.from({ length: 10 }, (_, i) => ({
    label: `${i * 10}-${(i + 1) * 10}%`,
    value: `${i * 10}-${(i + 1) * 10}`
  }));

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
          {uniqueTests.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Фильтр по группам */}
        <select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все группы</option>
          {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Фильтр по результату (проценты) */}
        <select
          value={scoreRangeFilter}
          onChange={e => setScoreRangeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Любой балл</option>
          {scoreRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
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
            <tr><td colSpan="5" className="no-results">Результаты не найдены</td></tr>
          ) : (
            filteredResults.map(res => (
              <tr key={res.id} onClick={() => openDetails(res.id)} className="clickable-row">
                <td>{res.student_name}</td>
                <td>{res.group_name || '—'}</td>
                <td>{res.test_title}</td>
                <td className={res.score >= 60 ? "score-pass" : "score-fail"}>{res.score}%</td>
                <td>
                  <button onClick={(e) => { e.stopPropagation(); deleteResult(res.id); }} className="delete-btn">
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
              <p><strong>Ученик:</strong> {selectedSubmission.display_name}</p>
              <p><strong>Группа:</strong> {selectedSubmission.group_name || 'без группы'}</p>
              <p><strong>Результат:</strong> <span className={selectedSubmission.score >= 60 ? "score-pass" : "score-fail"}>{selectedSubmission.score}%</span></p>
            </div>
            {/* ... список ответов (без изменений) ... */}
            <div className="responses-list">
              {selectedSubmission.responses?.map((resp, index) => (
                <div key={index} className={`response-item ${resp.is_correct ? 'correct' : 'incorrect'}`}>
                  <p className="question-text">{resp.question_text}</p>
                  <div className="answer-block">
                    <p><strong>Ответ ученика:</strong> {resp.user_answer || '—'}</p>
                    <p><strong>Правильный ответ:</strong> {resp.correct_answer || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;