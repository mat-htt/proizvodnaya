import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/CreateTest.css'; // Используем те же стили

const EditTest = () => {
    const { id } = useParams(); // Получаем ID из URL
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedLecture, setSelectedLecture] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Загружаем лекции и данные теста параллельно
                const [lecRes, testRes] = await Promise.all([
                    api.get('/lectures/'),
                    api.get(`/tests/${id}/`)
                ]);

                setLectures(lecRes.data);

                // Заполняем поля данными из БД
                setTitle(testRes.data.title);
                setDescription(testRes.data.description);
                setQuestions(testRes.data.questions);

                // Находим, к какой лекции привязан тест (если есть)
                const linkedLec = lecRes.data.find(l => l.related_test === parseInt(id));
                if (linkedLec) setSelectedLecture(linkedLec.id);

            } catch (err) {
                alert("Ошибка при загрузке теста");
                navigate('/manage-tests');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // Функции управления вопросами (такие же как в CreateTest)
    const handleQuestionChange = (qIndex, value) => {
        const newQs = [...questions];
        newQs[qIndex].text = value;
        setQuestions(newQs);
    };

    const handleChoiceChange = (qIndex, cIndex, field, value) => {
        const newQs = [...questions];
        if (field === 'is_correct') {
            // Сбрасываем все галочки в вопросе и ставим только одну
            newQs[qIndex].choices.forEach(c => c.is_correct = false);
            newQs[qIndex].choices[cIndex].is_correct = true;
        } else {
            newQs[qIndex].choices[cIndex][field] = value;
        }
        setQuestions(newQs);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', q_type: 'CHOICE', choices: [{ text: '', is_correct: false }, { text: '', is_correct: false }] }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/tests/${id}/`, {
                title,
                description,
                questions,
                lecture_id: selectedLecture
            });
            alert("Тест успешно обновлен!");
            navigate('/manage-tests');
        } catch (err) {
            alert("Ошибка при сохранении");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <p>Загрузка данных теста...</p>
        </div>
    );

    return (
        <div className="create-test-page">
            <div className="create-test-container">
                <h2 className="page-title">Редактирование теста #{id}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <input className="main-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Название теста" required />
                        <textarea className="main-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание теста" />
                        <select className="main-select" value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)}>
                            <option value="">Привязать к лекции (необязательно)</option>
                            {lectures.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                    </div>

                    <div className="questions-list">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="question-card">
                                <div className="question-header">
                                    <span>Вопрос {qIndex + 1}</span>
                                    <button type="button" onClick={() => removeQuestion(qIndex)} className="remove-q-btn">Удалить вопрос</button>
                                </div>
                                <input className="q-text-input" value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} placeholder="Текст вопроса" required />

                                <div className="choices-block">
                                    {q.choices.map((c, cIndex) => (
                                        <div key={cIndex} className="choice-row">
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={c.is_correct}
                                                onChange={() => handleChoiceChange(qIndex, cIndex, 'is_correct', true)}
                                            />
                                            <input
                                                className="choice-text-input"
                                                value={c.text}
                                                onChange={e => handleChoiceChange(qIndex, cIndex, 'text', e.target.value)}
                                                placeholder={`Вариант ${cIndex + 1}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="add-q-btn" onClick={addQuestion}>+ Добавить вопрос</button>
                        <button type="submit" className="submit-test-btn" disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTest;