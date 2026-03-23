import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации
import '../css/ManageTests.css';

const ManageTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTests = async () => {
        try {
            // Учитель запрашивает список всех тестов
            const res = await api.get('/tests/');
            setTests(res.data);
        } catch (err) {
            console.error("Ошибка при загрузке тестов:", err);
            // Если ошибка 403, значит permissions на бэке сработали верно
            if (err.response?.status === 403) {
                alert("Доступ запрещен. Только для учителей.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleDelete = async (id) => {
        // Обязательное подтверждение перед удалением
        if (window.confirm("Удалить этот тест и все связанные с ним результаты? Действие необратимо!")) {
            try {
                await api.delete(`/tests/${id}/`);
                // Обновляем стейт, убирая удаленный тест из списка
                setTests(tests.filter(t => t.id !== id));
            } catch (err) {
                console.error("Ошибка удаления:", err);
                alert("Ошибка при удалении. Возможно, этот тест используется в лекции или имеет результаты сдачи.");
            }
        }
    };

    // --- КРАСИВЫЙ ЦЕНТРИРОВАННЫЙ ЛОАДЕР ---
    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner"></div>
                <p>Загрузка списка тестов...</p>
            </div>
        );
    }

    return (
        <div className="manage-tests-page">
            <div className="manage-tests-container">
                <header className="page-header-actions">
                    <h2 className="page-title">⚙️ Управление тестами</h2>
                    {/* Кнопка быстрого перехода к созданию */}
                    <Link to="/create-test" className="create-new-test-btn">
                        + Создать новый
                    </Link>
                </header>

                {tests.length === 0 ? (
                    <div className="no-results-card">
                        <p>Тестов пока нет. Создайте свой первый тест!</p>
                    </div>
                ) : (
                    <div className="tests-grid">
                        {tests.map(test => (
                            <div key={test.id} className="test-manage-card">
                                <div className="test-info">
                                    <span className="test-id-tag">ID: {test.id}</span>
                                    <h3>{test.title}</h3>
                                    <p>{test.description || "Описание отсутствует."}</p>
                                    <small className="test-date">
                                        Создан: {new Date(test.created_at).toLocaleDateString()}
                                    </small>
                                </div>

                                {/* БЛОК КНОПОК ДЕЙСТВИЯ */}
                                <div className="test-actions-group">
                                    <Link
                                        to={`/edit-test/${test.id}`}
                                        className="action-btn edit-btn"
                                        title="Редактировать вопросы и ответы"
                                    >
                                        ✏️ Редактировать
                                    </Link>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(test.id)}
                                        title="Удалить тест навсегда"
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTests;