import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
            localStorage.setItem('access_token', res.data.access);
            navigate('/');
        } catch (err) { alert('Ошибка входа: проверьте логин или пароль'); }
    };

    return (
        <div className="auth-container">
            <h2>Вход в систему</h2>
            <form onSubmit={handleLogin} className="auth-form">
                <input type="text" placeholder="Логин" onChange={e => setUsername(e.target.value)} />
                <input type="password" placeholder="Пароль" onChange={e => setPassword(e.target.value)} />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};
export default Login;