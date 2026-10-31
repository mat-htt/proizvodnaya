import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TestEditor, { emptyQuestion } from '../components/TestEditor';
import { useToast } from '../components/Toast';

const CreateTest = () => {
  const navigate = useNavigate();
  const notify = useToast();
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    // Загружаем список лекций для выпадающего списка
    api.get('/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error('Ошибка загрузки лекций:', err));
  }, []);

  const handleSubmit = async (form) => {
    // Django сам создаст тест и привяжет его к лекции
    await api.post('/tests/', {
      title: form.title,
      description: form.description,
      series: form.series,
      variant: form.variant,
      questions: form.questions,
      related_lecture: form.lectureId || null,
    });
    notify('Тест опубликован');
    navigate('/manage-tests');
  };

  return (
    <TestEditor
      heading="Новый тест"
      submitLabel="Опубликовать тест"
      lectures={lectures}
      initial={{ title: '', description: '', series: '', variant: '', lectureId: '', questions: [emptyQuestion()] }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateTest;
