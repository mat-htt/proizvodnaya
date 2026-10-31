import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MathText } from '../utils/math';
import { ArrowLeft, Plus, Trash } from './Icons';
import '../css/CreateTest.css';

export const emptyQuestion = (q_type = 'TEXT') => ({
  text: '',
  q_type,
  correct_text_answer: '',
  choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }],
});

// Общий редактор для создания и редактирования теста.
// Поддерживает оба типа вопросов: выбор варианта и открытый ответ.
const TestEditor = ({ heading, initial, lectures, submitLabel, onSubmit }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateQuestion = (qIndex, patch) =>
    setForm(f => ({ ...f, questions: f.questions.map((q, i) => (i === qIndex ? { ...q, ...patch } : q)) }));

  const updateChoice = (qIndex, cIndex, patch) => {
    const q = form.questions[qIndex];
    const choices = q.choices.map((c, i) => {
      if (patch.is_correct) return { ...c, is_correct: i === cIndex }; // только один верный вариант
      return i === cIndex ? { ...c, ...patch } : c;
    });
    updateQuestion(qIndex, { choices });
  };

  const setType = (qIndex, q_type) => {
    const q = form.questions[qIndex];
    const choices = q.choices?.length >= 2 ? q.choices : emptyQuestion().choices;
    updateQuestion(qIndex, { q_type, choices });
  };

  const addQuestion = () => {
    const lastType = form.questions[form.questions.length - 1]?.q_type || 'TEXT';
    set('questions', [...form.questions, emptyQuestion(lastType)]);
  };

  const removeQuestion = (qIndex) => set('questions', form.questions.filter((_, i) => i !== qIndex));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.questions.length === 0) {
      setError('Добавьте хотя бы один вопрос.');
      return;
    }
    const broken = form.questions.findIndex(q => q.q_type === 'CHOICE' && !q.choices.some(c => c.is_correct));
    if (broken >= 0) {
      setError(`В вопросе ${broken + 1} отметьте правильный вариант.`);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        variant: form.variant ? Number(form.variant) : null,
        questions: form.questions.map(q => ({
          text: q.text,
          q_type: q.q_type,
          correct_text_answer: q.q_type === 'TEXT' ? q.correct_text_answer : '',
          choices: q.q_type === 'CHOICE' ? q.choices.map(({ text, is_correct }) => ({ text, is_correct })) : [],
        })),
      });
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Не удалось сохранить тест. Проверьте данные и попробуйте снова.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container container--narrow">
        <Link to="/manage-tests" className="back-link"><ArrowLeft size={16} /> Все тесты</Link>
        <header className="page-head">
          <h1 className="page-title">{heading}</h1>
          <p className="page-lead">Формулы пишите в LaTeX между знаками доллара: <code>$f(x) = x^2$</code>.</p>
        </header>

        <form onSubmit={handleSubmit} className="editor">
          <section className="card card--pad">
            <h2 className="editor__section-title">Основное</h2>
            <div className="field">
              <label className="label" htmlFor="t-title">Название теста</label>
              <input id="t-title" className="input" placeholder="Например: Производная сложной функции"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="t-desc">Описание</label>
              <textarea id="t-desc" className="textarea" placeholder="Коротко о чём этот тест"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="editor__row">
              <div className="field">
                <label className="label" htmlFor="t-lecture">Лекция</label>
                <select id="t-lecture" className="select" value={form.lectureId} onChange={e => set('lectureId', e.target.value)}>
                  <option value="">Без привязки к лекции</option>
                  {lectures.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="t-series">Серия (для вариантов)</label>
                <input id="t-series" className="input" placeholder="Итоговое тестирование: …"
                  value={form.series} onChange={e => set('series', e.target.value)} />
              </div>
              <div className="field editor__variant">
                <label className="label" htmlFor="t-variant">Вариант</label>
                <input id="t-variant" className="input" type="number" min="1" placeholder="№"
                  value={form.variant ?? ''} onChange={e => set('variant', e.target.value)} />
              </div>
            </div>
          </section>

          {form.questions.map((q, qIndex) => (
            <section key={qIndex} className="card card--pad qedit">
              <div className="qedit__head">
                <span className="qedit__num">Вопрос {qIndex + 1}</span>
                <div className="segmented" role="radiogroup" aria-label="Тип вопроса">
                  <button type="button" className={q.q_type === 'TEXT' ? 'is-active' : ''} onClick={() => setType(qIndex, 'TEXT')}>
                    Открытый ответ
                  </button>
                  <button type="button" className={q.q_type === 'CHOICE' ? 'is-active' : ''} onClick={() => setType(qIndex, 'CHOICE')}>
                    Выбор варианта
                  </button>
                </div>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => removeQuestion(qIndex)} aria-label="Удалить вопрос">
                  <Trash size={16} />
                </button>
              </div>

              <textarea
                className="textarea"
                rows={3}
                placeholder="Текст вопроса"
                value={q.text}
                onChange={e => updateQuestion(qIndex, { text: e.target.value })}
                required
              />
              {q.text.includes('$') && (
                <div className="qedit__preview">
                  <span>Предпросмотр</span>
                  <MathText as="p" text={q.text} />
                </div>
              )}

              {q.q_type === 'TEXT' ? (
                <div className="field">
                  <label className="label">Правильный ответ</label>
                  <input
                    className="input"
                    placeholder="Например: 12 или -1/25"
                    value={q.correct_text_answer || ''}
                    onChange={e => updateQuestion(qIndex, { correct_text_answer: e.target.value })}
                    required
                  />
                  <span className="hint">Числа сравниваются по значению: ответ «-0.04» будет засчитан для «-1/25».</span>
                </div>
              ) : (
                <div className="field">
                  <label className="label">Варианты ответа — отметьте правильный</label>
                  {q.choices.map((c, cIndex) => (
                    <div key={cIndex} className="choice-edit">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={c.is_correct}
                        onChange={() => updateChoice(qIndex, cIndex, { is_correct: true })}
                        aria-label={`Вариант ${cIndex + 1} правильный`}
                      />
                      <input
                        className="input"
                        placeholder={`Вариант ${cIndex + 1}`}
                        value={c.text}
                        onChange={e => updateChoice(qIndex, cIndex, { text: e.target.value })}
                        required
                      />
                      {q.choices.length > 2 && (
                        <button type="button" className="btn btn--ghost btn--sm" aria-label="Удалить вариант"
                          onClick={() => updateQuestion(qIndex, { choices: q.choices.filter((_, i) => i !== cIndex) })}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn--ghost btn--sm editor__add-choice"
                    onClick={() => updateQuestion(qIndex, { choices: [...q.choices, { text: '', is_correct: false }] })}>
                    <Plus size={16} /> Добавить вариант
                  </button>
                </div>
              )}
            </section>
          ))}

          <button type="button" className="editor__add" onClick={addQuestion}>
            <Plus size={18} /> Добавить вопрос
          </button>

          <div className="editor__footer">
            {error ? <div className="form-error">{error}</div> : <span className="hint">Вопросов: {form.questions.length}</span>}
            <button type="submit" className="btn btn--primary btn--lg" disabled={saving}>
              {saving ? 'Сохраняем…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestEditor;
