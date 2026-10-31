import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';
import { Edit, Trash, Plus, Book, Play, Chart } from '../components/Icons';
import { plural } from '../utils/format';
import '../css/ManageTests.css';

const ManageTests = () => {
  const notify = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests/')
      .then(res => setTests(res.data))
      .catch(err => console.error("Ошибка при загрузке тестов:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (test) => {
    if (!window.confirm(`Удалить тест «${test.title}» и все результаты по нему? Действие необратимо.`)) return;
    try {
      await api.delete(`/tests/${test.id}/`);
      setTests(tests.filter(t => t.id !== test.id));
      notify('Тест удалён');
    } catch (err) {
      console.error("Ошибка удаления:", err);
      notify(err.response?.status === 403 ? 'Удалять тесты может только учитель' : 'Не удалось удалить тест', 'error');
    }
  };

  if (loading) return <div className="state"><div className="spinner" />Загружаем тесты…</div>;

  return (
    <div className="page">
      <div className="container">
        <header className="page-head page-head__row">
          <div>
            <h1 className="page-title">Управление тестами</h1>
            <p className="page-lead">{tests.length} {plural(tests.length, 'тест', 'теста', 'тестов')} на платформе.</p>
          </div>
          <Link to="/create-test" className="btn btn--primary"><Plus size={18} /> Создать тест</Link>
        </header>

        {tests.length === 0 ? (
          <div className="state card">
            <h3>Тестов пока нет</h3>
            <p>Создайте первый тест — его увидят ученики в разделе «Тесты».</p>
          </div>
        ) : (
          <div className="manage-list">
            {tests.map(test => (
              <article key={test.id} className="manage-item">
                <div className="manage-item__main">
                  <div className="manage-item__badges">
                    {test.series
                      ? <span className="badge badge--brand">Вариант {test.variant ?? '—'}</span>
                      : <span className="badge">Тест</span>}
                    <span className="badge">{test.question_count} {plural(test.question_count, 'вопрос', 'вопроса', 'вопросов')}</span>
                    <span className="manage-item__id">#{test.id}</span>
                  </div>
                  <h3>{test.title}</h3>
                  <p className="manage-item__meta">
                    {test.lecture
                      ? <><Book size={14} /> {test.lecture.title}</>
                      : test.series || 'Без привязки к лекции'}
                    <span>·</span>
                    создан {new Date(test.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="manage-item__actions">
                  <Link to={`/quiz/${test.id}`} className="btn btn--ghost btn--sm" title="Открыть как ученик"><Play size={16} /> Просмотр</Link>
                  <Link to={`/test-stats/${test.id}`} className="btn btn--sm"><Chart size={16} /> Статистика</Link>
                  <Link to={`/edit-test/${test.id}`} className="btn btn--sm"><Edit size={16} /> Изменить</Link>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(test)} aria-label="Удалить тест">
                    <Trash size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTests;
