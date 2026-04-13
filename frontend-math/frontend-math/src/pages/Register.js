// frontend-math/src/pages/Register.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups/')
      .then(res => setGroups(res.data))
      .catch((err) => {
        console.error("Ошибка загрузки групп:", err);
      });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Убираем лишние пробелы в начале и конце
    const cleanUsername = username.trim();

    try {
      await api.post('/register/', {
        username: cleanUsername,
        password,
        group_id: groupId || null
      });
      alert('Регистрация прошла успешно! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      // Выводим конкретную причину ошибки от сервера
      const serverErrors = err.response?.data;
      if (serverErrors) {
        const errorMsg = Object.entries(serverErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(' ')}`)
          .join('\n');
        alert(`Ошибка регистрации:\n${errorMsg}`);
      } else {
        alert('Ошибка регистрации. Проверьте данные (возможно, логин занят)');
      }
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Логин (только латиница, цифры и _ - .)"
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
            autoComplete="new-password"
          />

          <select
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            className="auth-select"
          >
            <option value="">Выберите группу (можно позже)</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
};

export default Register;