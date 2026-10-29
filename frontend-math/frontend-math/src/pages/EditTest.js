import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import TestEditor from '../components/TestEditor';
import { useToast } from '../components/Toast';

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [lectures, setLectures] = useState([]);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    // Загружаем лекции и данные теста параллельно
    Promise.all([api.get('/lectures/'), api.get(`/tests/${id}/`)])
      .then(([lecRes, testRes]) => {
        const test = testRes.data;
        // Находим, к какой лекции привязан тест (если есть)
        const linkedLec = lecRes.data.find(l => l.related_test === parseInt(id, 10));
        setLectures(lecRes.data);
        setInitial({
          title: test.title,
          description: test.description || '',
          series: test.series || '',
          variant: test.variant ?? '',
          lectureId: linkedLec ? String(linkedLec.id) : '',
          questions: test.questions.map(q => ({
            text: q.text,
            q_type: q.q_type,
            correct_text_answer: q.correct_text_answer || '',
            choices: q.choices.length ? q.choices : [{ text: '', is_correct: true }, { text: '', is_correct: false }],
          })),
        });
      })
      .catch(() => {
        notify('Не удалось загрузить тест', 'error');
        navigate('/manage-tests');
      });
  }, [id, navigate, notify]);

  const handleSubmit = async (form) => {
    await api.put(`/tests/${id}/`, {
      title: form.title,
      description: form.description,
      series: form.series,
      variant: form.variant,
      questions: form.questions,
      lecture_id: form.lectureId || null,
    });
    notify('Изменения сохранены');
    navigate('/manage-tests');
  };

  if (!initial) return <div className="state"><div className="spinner" />Загружаем тест…</div>;

  return (
    <TestEditor
      heading={`Редактирование: ${initial.title}`}
      submitLabel="Сохранить изменения"
      lectures={lectures}
      initial={initial}
      onSubmit={handleSubmit}
    />
  );
};

export default EditTest;
