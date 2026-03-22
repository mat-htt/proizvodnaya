import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      // Обновляем глобальное состояние пользователя
      if (onLoginSuccess) await onLoginSuccess();

      navigate('/');
    } catch (err) {
      alert('Неверный логин или пароль');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Вход в систему</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
};

export default Login;