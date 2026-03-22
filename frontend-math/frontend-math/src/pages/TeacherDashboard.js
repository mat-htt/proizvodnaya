import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Main.css';
import '../css/TeacherDashboard.css';

const TeacherDashboard = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Состояние для поиска по имени
    const [testFilter, setTestFilter] = useState(""); // Состояние для фильтра по тесту

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/teacher/results/')
            .then(res => {
                setResults(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ошибка загрузки результатов:", err);
                setLoading(false);
            });
    }, []);

    // Логика фильтрации
    const filteredResults = results.filter(res => {
        const matchesName = res.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTest = testFilter === "" || res.test_title === testFilter;
        return matchesName && matchesTest;
    });

    // Список уникальных названий тестов для выпадающего списка
    const uniqueTests = [...new Set(results.map(res => res.test_title))];

    if (loading) {
        return (
            <div className="loading-container">
                <span className="loader"></span>
                <div className="loading-text">Загружаем данные...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2>Мониторинг успеваемости</h2>

            {/* Блок фильтров */}
            <div className="dashboard-filters">
                <input
                    type="text"
                    placeholder="Поиск по ученику..."
                    className="filter-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="filter-select"
                    value={testFilter}
                    onChange={(e) => setTestFilter(e.target.value)}
                >
                    <option value="">Все тесты</option>
                    {uniqueTests.map(test => (
                        <option key={test} value={test}>{test}</option>
                    ))}
                </select>
            </div>

            <table className="results-table">
                <thead>
                    <tr>
                        <th>Ученик</th>
                        <th>Тест</th>
                        <th>Результат</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredResults.length > 0 ? (
                        filteredResults.map(res => (
                            <tr key={res.id}>
                                <td>{res.student_name}</td>
                                <td>{res.test_title}</td>
                                <td className={res.score >= 50 ? "pass" : "fail"}>
                                    {res.score}%
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                Результаты не найдены
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherDashboard;