import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { Sun, Moon, Menu, Close } from './Icons';
import '../css/Header.css';

const getInitialTheme = () => {
  const saved = document.documentElement.getAttribute('data-theme');
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* приватный режим */ }
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Закрываем мобильное меню при переходе на другую страницу
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    onLogout();
    navigate('/login');
  };

  const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header__inner">
        <Logo />

        <nav className={`header__nav${menuOpen ? ' is-open' : ''}`} aria-label="Основная навигация">
          <NavLink to="/" end className={navClass}>Курс</NavLink>
          <NavLink to="/tests" className={navClass}>Тесты</NavLink>
          {user.isLoggedIn && !user.isTeacher && <NavLink to="/my-results" className={navClass}>Мои результаты</NavLink>}
          {user.isTeacher && (
            <>
              <span className="nav-divider" aria-hidden="true" />
              <NavLink to="/teacher" className={navClass}>Успеваемость</NavLink>
              <NavLink to="/manage-tests" className={navClass}>Конструктор</NavLink>
              <NavLink to="/live" className={navClass}>Эфир</NavLink>
            </>
          )}
          <NavLink to="/resources" className={navClass}>Материалы</NavLink>

          <div className="header__mobile-auth">
            {user.isLoggedIn ? (
              <button className="btn btn--block" onClick={handleLogout}>Выйти</button>
            ) : (
              <>
                <Link to="/login" className="btn btn--block">Войти</Link>
                <Link to="/register" className="btn btn--primary btn--block">Регистрация</Link>
              </>
            )}
          </div>
        </nav>

        <div className="header__actions">
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user.isLoggedIn ? (
            <div className="user-chip">
              <span className="user-chip__avatar" aria-hidden="true">{(user.username || '?').slice(0, 1).toUpperCase()}</span>
              <span className="user-chip__name">
                {user.username}
                <small>{user.isTeacher ? 'Учитель' : 'Ученик'}</small>
              </span>
              <button className="btn btn--sm" onClick={handleLogout}>Выйти</button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="btn btn--sm">Войти</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Регистрация</Link>
            </div>
          )}

          <button
            className="icon-btn header__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
