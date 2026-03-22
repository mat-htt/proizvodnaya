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
    // Загружаем список групп при монтировании компонента
    api.get('/groups/')
      .then(res => setGroups(res.data))
      .catch((err) => {
        console.error("Ошибка загрузки групп:", err);
      });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register/', {
        username,
        password,
        // Передаем только логин, пароль и ID группы
        group_id: groupId || null
      });
      alert('Регистрация прошла успешно! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Ошибка регистрации. Проверьте данные (возможно, логин занят)');
    }
  };

  return (
    <div className="auth-page-wrapper"> {/* Центрирующий контейнер */}
      <div className="auth-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Логин (ваш ник)"
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

          {/* Улучшенный выпадающий список выбора группы */}
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