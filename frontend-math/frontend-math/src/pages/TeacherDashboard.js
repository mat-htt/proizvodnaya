import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Main.css';
import '../css/TeacherDashboard.css';

const TeacherDashboard = () => {
    const [results, setResults] = useState([]);
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/teacher/results/')
            .then(res => setResults(res.data));
    }, []);

    return (
        <div className="page-container">
            <h2>Мониторинг успеваемости</h2>
            <table className="results-table">
                <thead>
                    <tr><th>Ученик</th><th>Тест</th><th>Результат</th></tr>
                </thead>
                <tbody>
                    {results.map(res => (
                        <tr key={res.id}>
                            <td>{res.student_name}</td>
                            <td>{res.test_title}</td>
                            <td className={res.score > 50 ? "pass" : "fail"}>{res.score}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default TeacherDashboard;