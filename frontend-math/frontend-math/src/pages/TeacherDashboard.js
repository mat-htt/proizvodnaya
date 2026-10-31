import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';
import { MathText } from '../utils/math';
import { formatDate, scoreTone } from '../utils/format';
import { Close, Download, Search, Trash, Plus, Check, Cross } from '../components/Icons';
import '../css/TeacherDashboard.css';
import '../css/Tests.css';

const SCORE_RANGES = [
  { label: 'Не сдано (< 60%)', value: '0-60' },
  { label: '60–79%', value: '60-80' },
  { label: '80–100%', value: '80-101' },
];

// Выгрузка отфильтрованных результатов в CSV (открывается в Excel)
const exportCsv = (rows) => {
  const header = ['Ученик', 'Группа', 'Тест', 'Результат, %', 'Дата'];
  const lines = rows.map(r => [r.student_name, r.group_name || '', r.test_title, r.score, new Date(r.submitted_at).toLocaleString('ru-RU')]);
  const csv = [header, ...lines]
    .map(line => line.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `results-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const TeacherDashboard = () => {
  const notify = useToast();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [testFilter, setTestFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [scoreRangeFilter, setScoreRangeFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    api.get('/results/')
      .then(res => setResults(res.data))
      .catch(err => {
        console.error('Ошибка загрузки результатов:', err);
        if (err.response?.status === 403) setForbidden(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const openDetails = async (row) => {
    try {
      const res = await api.get(`/submission/${row.id}/`);
      setSelectedSubmission({
        ...res.data,
        display_name: (res.data.student_name && res.data.student_name !== "—") ? res.data.student_name : row.student_name,
        submitted_at: row.submitted_at,
        test_id: row.test,
      });
    } catch (err) {
      console.error(err);
      notify('Не удалось загрузить детали попытки', 'error');
    }
  };

  // Закрытие модального окна по Esc
  useEffect(() => {
    if (!selectedSubmission) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSelectedSubmission(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedSubmission]);

  const deleteResult = async (id) => {
    if (!window.confirm('Удалить результат навсегда?')) return;
    try {
      await api.delete(`/submission/${id}/`);
      setResults(results.filter(r => r.id !== id));
      notify('Результат удалён');
    } catch (err) {
      notify('Ошибка удаления', 'error');
    }
  };

  const filteredResults = useMemo(() => results.filter(res => {
    const matchesSearch = res.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTest = testFilter === "" || res.test_title === testFilter;
    const matchesGroup = groupFilter === "" || res.group_name === groupFilter;
    let matchesScore = true;
    if (scoreRangeFilter !== "") {
      const [min, max] = scoreRangeFilter.split('-').map(Number);
      matchesScore = res.score >= min && res.score < max;
    }
    return matchesSearch && matchesTest && matchesGroup && matchesScore;
  }), [results, searchTerm, testFilter, groupFilter, scoreRangeFilter]);

  const uniqueTests = [...new Set(results.map(r => r.test_title))];
  const uniqueGroups = [...new Set(results.map(r => r.group_name).filter(Boolean))];

  const stats = useMemo(() => {
    const n = filteredResults.length;
    const avg = n ? Math.round(filteredResults.reduce((s, r) => s + r.score, 0) / n) : 0;
    const passRate = n ? Math.round((filteredResults.filter(r => r.score >= 60).length / n) * 100) : 0;
    const students = new Set(filteredResults.map(r => r.student_name)).size;
    return { n, avg, passRate, students };
  }, [filteredResults]);

  if (loading) return <div className="state"><div className="spinner" />Загружаем результаты…</div>;
  if (forbidden) return <div className="state"><h3>Раздел доступен только учителям</h3><Link to="/" className="btn">На главную</Link></div>;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head page-head__row">
          <div>
            <h1 className="page-title">Успеваемость</h1>
            <p className="page-lead">Нажмите на строку, чтобы открыть разбор ответов ученика.</p>
          </div>
          <div className="dash__actions">
            <button className="btn" onClick={() => exportCsv(filteredResults)} disabled={!filteredResults.length}>
              <Download size={18} /> Экспорт CSV
            </button>
            <Link to="/create-test" className="btn btn--primary"><Plus size={18} /> Новый тест</Link>
          </div>
        </header>

        <div className="stat-grid">
          <div className="stat"><div className="stat__label">Попыток</div><div className="stat__value">{stats.n}</div></div>
          <div className="stat"><div className="stat__label">Учеников</div><div className="stat__value">{stats.students}</div></div>
          <div className="stat"><div className="stat__label">Средний балл</div><div className="stat__value">{stats.avg}%</div></div>
          <div className="stat">
            <div className="stat__label">Сдали (≥ 60%)</div>
            <div className="stat__value">{stats.passRate}%</div>
            <div className="dash__meter"><span style={{ width: `${stats.passRate}%` }} /></div>
          </div>
        </div>

        <div className="dash__filters">
          <label className="dash__search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск по ученику"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </label>
          <select value={testFilter} onChange={e => setTestFilter(e.target.value)} className="select">
            <option value="">Все тесты</option>
            {uniqueTests.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="select">
            <option value="">Все группы</option>
            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={scoreRangeFilter} onChange={e => setScoreRangeFilter(e.target.value)} className="select">
            <option value="">Любой балл</option>
            {SCORE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Группа</th>
                <th>Тест</th>
                <th>Дата</th>
                <th>Результат</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr><td colSpan="6" className="dash__empty">Результаты не найдены</td></tr>
              ) : (
                filteredResults.map(res => (
                  <tr key={res.id} onClick={() => openDetails(res)} className="is-clickable">
                    <td>
                      <span className="dash__student">
                        <span className="dash__avatar">{res.student_name.slice(0, 1).toUpperCase()}</span>
                        {res.student_name}
                      </span>
                    </td>
                    <td>{res.group_name || <span className="dash__muted">—</span>}</td>
                    <td>{res.test_title}</td>
                    <td className="dash__muted">{formatDate(res.submitted_at)}</td>
                    <td><span className={`score score--${scoreTone(res.score)}`}>{res.score}%</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResult(res.id); }}
                        className="btn btn--danger btn--sm"
                        aria-label="Удалить результат"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div className="modal-backdrop" onClick={() => setSelectedSubmission(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="icon-btn modal__close" onClick={() => setSelectedSubmission(null)} aria-label="Закрыть">
              <Close size={18} />
            </button>
            <h2 className="dash__modal-title">{selectedSubmission.test_title}</h2>
            <Link to={`/test-stats/${selectedSubmission.test_id}`} className="dash__modal-link">Статистика по всем задачам теста →</Link>
            <div className="dash__modal-meta">
              <span><small>Ученик</small>{selectedSubmission.display_name}</span>
              <span><small>Группа</small>{selectedSubmission.group_name || 'без группы'}</span>
              <span><small>Дата</small>{formatDate(selectedSubmission.submitted_at)}</span>
              <span>
                <small>Результат</small>
                <span className={`score score--${scoreTone(selectedSubmission.score)}`}>{selectedSubmission.score}%</span>
              </span>
            </div>

            <ol className="dash__responses">
              {selectedSubmission.responses?.map((resp, index) => (
                <li key={index} className={resp.is_correct ? 'is-correct' : 'is-wrong'}>
                  <span className="dash__resp-icon">{resp.is_correct ? <Check size={14} /> : <Cross size={14} />}</span>
                  <div>
                    <MathText as="p" className="dash__resp-q" text={resp.question_text} />
                    <div className="dash__resp-a">
                      <span>Ответ: <strong>{resp.user_answer || '—'}</strong></span>
                      {!resp.is_correct && <span>Верно: <strong>{resp.correct_answer || '—'}</strong></span>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {selectedSubmission.responses?.length === 0 && <p className="dash__muted">Ученик не ответил ни на один вопрос.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
