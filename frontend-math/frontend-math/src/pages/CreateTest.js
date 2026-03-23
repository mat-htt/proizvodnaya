import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/CreateTest.css';

const CreateTest = () => {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedLecture, setSelectedLecture] = useState('');
    const [loading, setLoading] = useState(false);

    // Начальное состояние вопроса
    const [questions, setQuestions] = useState([
        {
            text: '',
            q_type: 'CHOICE',
            choices: [{ text: '', is_correct: false }, { text: '', is_correct: false }]
        }
    ]);

    useEffect(() => {
        // Загружаем список лекций для выпадающего списка
        api.get('/lectures/')
            .then(res => setLectures(res.data))
            .catch(err => console.error('Ошибка загрузки лекций:', err));
    }, []);

    const addQuestion = () => {
        setQuestions([...questions, {
            text: '',
            q_type: 'CHOICE',
            choices: [{ text: '', is_correct: false }, { text: '', is_correct: false }]
        }]);
    };

    const handleQuestionChange = (qIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].text = value;
        setQuestions(newQuestions);
    };

    const handleChoiceChange = (qIndex, cIndex, field, value) => {
        const newQuestions = [...questions];
        const question = newQuestions[qIndex];

        if (field === 'is_correct') {
            // Сбрасываем правильные ответы у всех вариантов этого вопроса (только один верный)
            question.choices.forEach((c, idx) => {
                c.is_correct = idx === cIndex;
            });
        } else {
            question.choices[cIndex][field] = value;
        }
        setQuestions(newQuestions);
    };

    const addChoice = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].choices.push({ text: '', is_correct: false });
        setQuestions(newQuestions);
    };

    const removeQuestion = (qIndex) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, index) => index !== qIndex));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const testData = {
                title,
                description,
                questions,
                related_lecture: selectedLecture // Отправляем ID лекции серверу
            };

            // Теперь только один запрос! Django сам создаст тест и привяжет его к лекции.
            await api.post('/tests/', testData);

            alert('Тест успешно создан!');
            navigate('/teacher');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            alert('Не удалось сохранить тест. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-test-page">
            <div className="create-test-container">
                <h2 className="page-title">📝 Создание нового теста</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label>Название теста</label>
                        <input
                            className="main-input"
                            placeholder="Например: Производная сложной функции"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />

                        <label>Описание</label>
                        <textarea
                            className="main-textarea"
                            placeholder="Коротко о чем этот тест..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />

                        <label>Привязать к лекции</label>
                        <select
                            className="main-select"
                            value={selectedLecture}
                            onChange={e => setSelectedLecture(e.target.value)}
                            required
                        >
                            <option value="">-- Выберите лекцию --</option>
                            {lectures.map(lec => (
                                <option key={lec.id} value={lec.id}>{lec.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="questions-list">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="question-card">
                                <div className="question-header">
                                    <span>Вопрос №{qIndex + 1}</span>
                                    {questions.length > 1 && (
                                        <button type="button" className="delete-btn" onClick={() => removeQuestion(qIndex)}>Удалить</button>
                                    )}
                                </div>

                                <input
                                    className="q-text-input"
                                    placeholder="Введите текст вопроса"
                                    value={q.text}
                                    onChange={e => handleQuestionChange(qIndex, e.target.value)}
                                    required
                                />

                                <div className="choices-block">
                                    <p className="label-sm">Варианты ответа (отметьте правильный):</p>
                                    {q.choices.map((c, cIndex) => (
                                        <div key={cIndex} className="choice-row">
                                            <input
                                                type="radio"
                                                name={`correct_${qIndex}`}
                                                checked={c.is_correct}
                                                onChange={() => handleChoiceChange(qIndex, cIndex, 'is_correct', true)}
                                                required
                                            />
                                            <input
                                                placeholder={`Вариант ${cIndex + 1}`}
                                                value={c.text}
                                                onChange={e => handleChoiceChange(qIndex, cIndex, 'text', e.target.value)}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="add-choice-btn" onClick={() => addChoice(qIndex)}>
                                    + Добавить вариант
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="add-q-btn" onClick={addQuestion}>Добавить вопрос</button>
                        <button type="submit" className="submit-test-btn" disabled={loading}>
                            {loading ? 'Сохранение...' : 'Опубликовать тест'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTest;