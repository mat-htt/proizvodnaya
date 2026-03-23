import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    onLogout(); // Вызываем функцию из App.js, чтобы обнулить состояние
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">MathBase</Link>
      <nav className="header-nav">
        <Link to="/" className="header-link">Темы</Link>

        {user.isLoggedIn ? (
          <>
            {user.isTeacher && (
              <>
                <Link to="/teacher" className="header-link">Панель учителя</Link>
                <Link to="/manage-tests" className="header-link">Список тестов</Link>
                <Link to="/create-test" className="header-link">Создать тест</Link>
              </>
            )}
            <button onClick={handleLogout} className="logout-btn">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link">Вход</Link>
            <Link to="/register" className="header-link register-btn">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;