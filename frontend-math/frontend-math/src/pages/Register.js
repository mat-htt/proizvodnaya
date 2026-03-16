import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/register/', { username, password });
            alert('Регистрация успешна!');
            navigate('/login');
        } catch (err) { alert('Ошибка регистрации'); }
    };

    return (
        <div className="auth-container">
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister} className="auth-form">
                <input type="text" placeholder="Логин" onChange={e => setUsername(e.target.value)} />
                <input type="password" placeholder="Пароль" onChange={e => setPassword(e.target.value)} />
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};
export default Register;