import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">MathBase</Link>
      <nav className="header-nav">
        <Link to="/" className="header-link">Темы</Link>
        {isLoggedIn ? (
          <>
            <Link to="/teacher" className="header-link">Панель учителя</Link>
            <button onClick={handleLogout} className="logout-btn">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link">Войти</Link>
            <Link to="/register" className="register-btn">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;