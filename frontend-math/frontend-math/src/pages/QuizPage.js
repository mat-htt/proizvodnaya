import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { MathText } from '../utils/math';
import { useToast } from '../components/Toast';
import { ArrowLeft, Check, Cross } from '../components/Icons';
import { plural, scoreTone } from '../utils/format';
import '../css/QuizPage.css';

const draftKey = (id) => `quiz-draft-${id}`;

const readDraft = (id) => {
  try { return JSON.parse(localStorage.getItem(draftKey(id))) || {}; } catch (e) { return {}; }
};

const isAnswered = (a) => Boolean(a && (a.choiceId || (a.text && a.text.trim())));

const verdict = (score) => {
  if (score >= 90) return 'Отлично! Материал усвоен уверенно.';
  if (score >= 70) return 'Хороший результат — осталось разобрать пару задач.';
  if (score >= 50) return 'Неплохо, но стоит повторить теорию.';
  return 'Вернитесь к лекциям и попробуйте ещё раз.';
};

const QuizPage = () => {
  const { id } = useParams();
  const notify = useToast();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState(() => readDraft(id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setResult(null);
    setAnswers(readDraft(id));
    api.get(`/tests/${id}/`)
      .then(res => setTest(res.data))
      .catch(err => {
        console.error('Ошибка загрузки теста:', err);
        setError(err.response?.status === 404 ? 'Тест не найден' : 'Не удалось загрузить тест. Попробуйте позже.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Черновик ответов переживает перезагрузку страницы
  useEffect(() => {
    if (result) return;
    try { localStorage.setItem(draftKey(id), JSON.stringify(answers)); } catch (e) { /* нет доступа */ }
  }, [answers, id, result]);

  // После проверки показываем результат вверху страницы
  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result]);

  const setAnswer = (questionId, value) => setAnswers(prev => ({ ...prev, [questionId]: value }));

  const answeredCount = useMemo(
    () => (test ? test.questions.filter(q => isAnswered(answers[q.id])).length : 0),
    [answers, test]
  );

  const handleSubmit = async () => {
    const left = test.questions.length - answeredCount;
    if (left > 0 && !window.confirm(`Без ответа ${left} ${plural(left, 'вопрос', 'вопроса', 'вопросов')}. Всё равно завершить тест?`)) return;

    setSubmitting(true);
    try {
      const res = await api.post('/submit-test/', {
        test_id: parseInt(id, 10),
        answers: Object.keys(answers).filter(qId => isAnswered(answers[qId])).map(qId => ({
          question_id: parseInt(qId, 10),
          selected_choice_id: answers[qId].choiceId || null,
          text_answer: answers[qId].text?.trim() || null,
        })),
      });
      setResult(res.data);
      localStorage.removeItem(draftKey(id));
    } catch (err) {
      console.error('Ошибка отправки теста:', err);
      notify('Не удалось отправить тест. Попробуйте снова.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setResult(null);
    setAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpTo = (qId) => document.getElementById(`q-${qId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (loading) return <div className="state"><div className="spinner" />Загружаем тест…</div>;
  if (error) return <div className="state"><h3>{error}</h3><Link to="/tests" className="btn">Ко всем тестам</Link></div>;

  const total = test.questions.length;
  const detailsById = Object.fromEntries((result?.details || []).map(d => [d.question_id, d]));

  return (
    <div className="page quiz">
      <div className="container container--narrow">
        <Link to="/tests" className="back-link"><ArrowLeft size={16} /> Все тесты</Link>

        <header className="quiz__head">
          {test.variant && <span className="badge badge--brand">Вариант {test.variant}</span>}
          <h1 className="page-title">{test.title}</h1>
          {test.description && <p className="page-lead">{test.description}</p>}
        </header>

        {/* ---------- Результат ---------- */}
        {result && (
          <section className="result">
            <div className={`result__score result__score--${scoreTone(result.score)}`}>{result.score}%</div>
            <div className="result__copy">
              <h2>{verdict(result.score)}</h2>
              <p>
                Верно <strong>{result.correct_count}</strong> из <strong>{result.total}</strong>.
                Ниже — разбор каждой задачи с правильными ответами.
              </p>
              <div className="result__actions">
                <button className="btn btn--primary" onClick={restart}>Пройти ещё раз</button>
                <Link to="/my-results" className="btn">Мои результаты</Link>
              </div>
            </div>
          </section>
        )}

        {/* ---------- Прогресс ---------- */}
        {!result && (
          <div className="quiz__bar">
            <div className="quiz__bar-top">
              <span>Отвечено <strong>{answeredCount}</strong> из {total}</span>
              <div className="quiz__dots">
                {test.questions.map((q, i) => (
                  <button
                    key={q.id}
                    className={`quiz__dot${isAnswered(answers[q.id]) ? ' is-done' : ''}`}
                    onClick={() => jumpTo(q.id)}
                    aria-label={`Перейти к вопросу ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="quiz__track"><div style={{ width: `${(answeredCount / Math.max(total, 1)) * 100}%` }} /></div>
          </div>
        )}

        {/* ---------- Вопросы ---------- */}
        <ol className="quiz__list">
          {test.questions.map((q, i) => {
            const detail = detailsById[q.id];
            const state = detail ? (detail.is_correct ? 'is-correct' : 'is-wrong') : '';
            return (
              <li key={q.id} id={`q-${q.id}`} className={`qcard ${state}`}>
                <div className="qcard__head">
                  <span className="qcard__num">Задача {i + 1}</span>
                  {detail && (
                    <span className={`badge badge--${detail.is_correct ? 'good' : 'bad'}`}>
                      {detail.is_correct ? <><Check size={14} /> Верно</> : <><Cross size={14} /> Ошибка</>}
                    </span>
                  )}
                </div>

                <MathText as="p" className="qcard__text" text={q.text} />

                {q.q_type === 'CHOICE' ? (
                  <div className="options">
                    {q.choices.map(choice => (
                      <label
                        key={choice.id}
                        className={`option${answers[q.id]?.choiceId === choice.id ? ' is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          disabled={Boolean(result)}
                          onChange={() => setAnswer(q.id, { choiceId: choice.id })}
                          checked={answers[q.id]?.choiceId === choice.id}
                        />
                        <span className="option__mark" />
                        <MathText text={choice.text} />
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="answer-field">
                    <input
                      className="answer-field__input"
                      placeholder="Например: 12 или -1/25"
                      inputMode="text"
                      autoComplete="off"
                      disabled={Boolean(result)}
                      value={answers[q.id]?.text || ''}
                      onChange={e => setAnswer(q.id, { text: e.target.value })}
                    />
                  </div>
                )}

                {detail && !detail.is_correct && (
                  <div className="qcard__review">
                    <span>Ваш ответ: <strong>{detail.user_answer || '—'}</strong></span>
                    <span>Правильный: <MathText as="strong" text={detail.correct_answer || '—'} /></span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {!result && (
          <div className="quiz__submit">
            <p>
              {answeredCount === total
                ? 'Все вопросы отвечены — можно отправлять.'
                : 'Ответы сохраняются автоматически: можно закрыть вкладку и вернуться позже.'}
            </p>
            <button onClick={handleSubmit} className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? 'Проверяем…' : 'Завершить тест'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
