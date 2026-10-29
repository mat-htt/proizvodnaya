import React, { useState } from 'react';
import api from '../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../components/Toast';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/token/', { username: username.trim(), password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      // Обновляем глобальное состояние пользователя
      if (onLoginSuccess) await onLoginSuccess();

      notify('Вы вошли в систему');
      // Возвращаем туда, откуда пользователя отправили на вход
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.response ? 'Неверный логин или пароль' : 'Сервер недоступен. Проверьте, что backend запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы проходить тесты и видеть свой прогресс."
      footer={<>Нет аккаунта? <Link to="/register" state={location.state}>Зарегистрироваться</Link></>}
    >
      <form onSubmit={handleLogin}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="field">
          <label className="label" htmlFor="login-username">Логин</label>
          <input
            id="login-username"
            className="input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
