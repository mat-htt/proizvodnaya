import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';  // ← используем наш api с токеном
import '../css/Main.css';
import '../css/QuizPage.css';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});     // { question_id: { choiceId: number } или { text: string } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);     // после отправки: { score, correct_count, total }

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.get(`/tests/${id}/`);
        setTest(res.data);
      } catch (err) {
        console.error('Ошибка загрузки теста:', err);
        setError('Не удалось загрузить тест. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleChoiceChange = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { choiceId },
    }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { text },
    }));
  };

  const handleSubmit = async () => {
    if (!localStorage.getItem('access_token')) {
      alert('Войдите в систему, чтобы отправить тест');
      navigate('/login');
      return;
    }

    const formattedAnswers = Object.keys(answers).map(qId => ({
      question_id: parseInt(qId),
      selected_choice_id: answers[qId]?.choiceId || null,
      text_answer: answers[qId]?.text || null,
    }));

    try {
      const res = await api.post('/submit-test/', {
        test_id: parseInt(id),
        answers: formattedAnswers,
      });

      setResult(res.data);
      alert(`Тест завершён! Ваш результат: ${res.data.score}% (${res.data.correct_count} из ${res.data.total})`);
    } catch (err) {
      console.error('Ошибка отправки теста:', err);
      alert('Ошибка при отправке теста. Попробуйте снова.');
    }
  };

  if (loading) return <div className="loading">Загрузка теста...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!test) return <div className="not-found">Тест не найден</div>;

  return (
    <div className="quiz-page">
      <h1 className="quiz-title">{test.title}</h1>
      {test.description && <p className="quiz-description">{test.description}</p>}

      <div className="questions-list">
        {test.questions.map(question => (
          <div key={question.id} className="question-card">
            <p className="question-text">
              <strong>{question.text}</strong>
              {question.q_type === 'TEXT' && <span className="text-hint"> (открытый ответ)</span>}
            </p>

            {question.q_type === 'CHOICE' ? (
              <div className="choices">
                {question.choices.map(choice => (
                  <label key={choice.id} className="choice-label">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      onChange={() => handleChoiceChange(question.id, choice.id)}
                      checked={answers[question.id]?.choiceId === choice.id}
                    />
                    {choice.text}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="text-answer"
                placeholder="Введите ваш ответ..."
                onChange={e => handleTextChange(question.id, e.target.value)}
                value={answers[question.id]?.text || ''}
                rows={4}
              />
            )}
          </div>
        ))}
      </div>

      <div className="submit-section">
        {localStorage.getItem('access_token') ? (
          <button onClick={handleSubmit} className="submit-btn">
            Завершить тест
          </button>
        ) : (
          <p className="auth-warning">
            Чтобы отправить тест, <Link to="/login">войдите в систему</Link>
          </p>
        )}
      </div>

      {result && (
        <div className="result-card">
          <h2>Результат</h2>
          <p>Ваш балл: <strong>{result.score}%</strong></p>
          <p>Правильных ответов: <strong>{result.correct_count}</strong> из <strong>{result.total}</strong></p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;