import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    axios.post('http://127.0.0.1:8000/api/submit-test/', {
      test_id: parseInt(id),
      answers: formattedAnswers
    })
    .then(res => {
      alert(`Ваш результат: ${res.data.score}%`);
      navigate('/');
    })
    .catch(err => alert("Ошибка при отправке"));
  };

  if (!test) return <div style={{ padding: '50px', textAlign: 'center' }}>Загрузка вопросов...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <h2>Тест: {test.title}</h2>
      {test.questions.map(q => (
        <div key={q.id} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
          <p><strong>{q.text}</strong></p>
          {q.q_type === 'CHOICE' ? (
            q.choices.map(c => (
              <label key={c.id} style={{ display: 'block', margin: '5px 0' }}>
                <input type="radio" name={`q${q.id}`} onChange={() => setAnswers({...answers, [q.id]: {choiceId: c.id}})} /> {c.text}
              </label>
            ))
          ) : (
            <input type="text" style={{ width: '100%', padding: '8px' }} onChange={(e) => setAnswers({...answers, [q.id]: {text: e.target.value}})} />
          )}
        </div>
      ))}
      <button onClick={handleSubmit} style={{ background: '#2e7d32', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
        Отправить результат
      </button>
    </div>
  );
};

export default QuizPage;