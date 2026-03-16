import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Main.css';
import '../css/QuizPage.css';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/tests/${id}/`)
      .then(res => setTest(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleSubmit = () => {
    const formattedAnswers = Object.keys(answers).map(qId => ({
      question_id: parseInt(qId),
      selected_choice_id: answers[qId].choiceId || null,
      text_answer: answers[qId].text || ""
    }));

    axios.post('http://127.0.0.1:8000/api/submit-test/', { test_id: parseInt(id), answers: formattedAnswers })
      .then(res => { alert(`Результат: ${res.data.score}%`); navigate('/'); })
      .catch(err => alert("Ошибка при отправке"));
  };

  if (!test) return <div className="loading">Загрузка теста...</div>;

  return (
    <div className="page-container">
      <h2>{test.title}</h2>
      {test.questions.map(q => (
        <div key={q.id} className="question-card">
          <p><strong>{q.text}</strong></p>
          {q.q_type === 'CHOICE' ? q.choices.map(c => (
            <label key={c.id} className="choice-label">
              <input type="radio" name={`q${q.id}`} onChange={() => setAnswers({...answers, [q.id]: {choiceId: c.id}})} /> {c.text}
            </label>
          )) : <input type="text" onChange={(e) => setAnswers({...answers, [q.id]: {text: e.target.value}})} />}
        </div>
      ))}
      <button onClick={handleSubmit} className="submit-btn">Завершить тест</button>
    </div>
  );
};
export default QuizPage;