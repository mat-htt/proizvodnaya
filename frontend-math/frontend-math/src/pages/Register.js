import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../components/Toast';

const FIELD_NAMES = { username: 'Логин', password: 'Пароль', group_id: 'Группа' };

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();

  useEffect(() => {
    api.get('/groups/')
      .then(res => setGroups(res.data))
      .catch((err) => {
        console.error("Ошибка загрузки групп:", err);
      });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/register/', {
        username: username.trim(),
        password,
        group_id: groupId || null
      });
      notify('Аккаунт создан — теперь войдите');
      // Сохраняем, куда ученик шёл (например, по QR-коду на тест)
      navigate('/login', { state: location.state });
    } catch (err) {
      console.error(err);
      // Выводим конкретную причину ошибки от сервера
      const serverErrors = err.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        setError(Object.entries(serverErrors)
          .map(([field, msgs]) => `${FIELD_NAMES[field] || field}: ${[].concat(msgs).join(' ')}`)
          .join('\n'));
      } else {
        setError('Ошибка регистрации. Проверьте данные (возможно, логин занят).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Регистрация займёт меньше минуты."
      footer={<>Уже есть аккаунт? <Link to="/login" state={location.state}>Войти</Link></>}
    >
      <form onSubmit={handleRegister}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="field">
          <label className="label" htmlFor="reg-username">Логин</label>
          <input
            id="reg-username"
            className="input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
          <span className="hint">Латиница, цифры и символы _ - . @ +</span>
        </div>

        <div className="field">
          <label className="label" htmlFor="reg-password">Пароль</label>
          <input
            id="reg-password"
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="reg-group">Группа</label>
          <select
            id="reg-group"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            className="select"
          >
            <option value="">Выберите группу (можно позже)</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
          {loading ? 'Создаём…' : 'Зарегистрироваться'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
