import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { Sun, Moon, Menu, Close } from './Icons';
import '../css/Header.css';

const getInitialTheme = () => {
  const saved = document.documentElement.getAttribute('data-theme');
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Переключатель темы в виде тумблера — используется в меню профиля и в мобильном меню
const ThemeSwitch = ({ theme, onToggle }) => (
  <button type="button" className="theme-row" onClick={onToggle} role="switch" aria-checked={theme === 'dark'}>
    <span className="theme-row__label">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Тёмная тема</span>
    <span className={`switch${theme === 'dark' ? ' is-on' : ''}`} aria-hidden="true"><span /></span>
  </button>
);

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

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

  // Закрываем меню при переходе на другую страницу
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname]);

  // Меню профиля закрывается кликом мимо него и клавишей Esc
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onClick = (e) => { if (!profileRef.current?.contains(e.target)) setProfileOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    onLogout();
    navigate('/login');
  };

  const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;
  const displayName = user.fullName || user.username;
  const initial = (displayName || '?').slice(0, 1).toUpperCase();

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="container header__inner">
        <Logo />

        <nav className={`header__nav${menuOpen ? ' is-open' : ''}`} aria-label="Основная навигация">
          <NavLink to="/" end className={navClass}>Курс</NavLink>
          <NavLink to="/tests" className={navClass}>Тесты</NavLink>
          {user.isLoggedIn && !user.isTeacher && <NavLink to="/my-results" className={navClass}>Мои результаты</NavLink>}
          {user.isTeacher && (
            <>
              <NavLink to="/teacher" className={navClass}>Успеваемость</NavLink>
              <NavLink to="/manage-tests" className={navClass}>Конструктор</NavLink>
              <NavLink to="/live" className={navClass}>Эфир</NavLink>
            </>
          )}
          <NavLink to="/resources" className={navClass}>Материалы</NavLink>

          <div className="header__mobile-extra">
            <ThemeSwitch theme={theme} onToggle={toggleTheme} />
            {user.isLoggedIn ? (
              <button className="btn btn--block" onClick={handleLogout}>Выйти</button>
            ) : (
              <div className="header__mobile-auth">
                <Link to="/login" className="btn btn--block">Войти</Link>
                <Link to="/register" className="btn btn--primary btn--block">Регистрация</Link>
              </div>
            )}
          </div>
        </nav>

        <div className="header__actions">
          {user.isLoggedIn ? (
            <div className="profile" ref={profileRef}>
              <button
                className={`profile__btn${profileOpen ? ' is-open' : ''}`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="profile__avatar" aria-hidden="true">{initial}</span>
                <span className="profile__name">{displayName}</span>
                <svg className="profile__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                  <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen && (
                <div className="profile__menu" role="menu">
                  <div className="profile__head">
                    <span className="profile__avatar profile__avatar--lg">{initial}</span>
                    <div>
                      <strong>{displayName}</strong>
                      <small>{user.isTeacher ? 'Учитель' : 'Ученик'} · @{user.username}</small>
                    </div>
                  </div>
                  {user.isTeacher
                    ? <Link to="/teacher" className="profile__item" role="menuitem">Успеваемость</Link>
                    : <Link to="/my-results" className="profile__item" role="menuitem">Мои результаты</Link>}
                  <Link to="/tests" className="profile__item" role="menuitem">Тесты</Link>
                  <ThemeSwitch theme={theme} onToggle={toggleTheme} />
                  <button className="profile__item profile__item--danger" onClick={handleLogout} role="menuitem">Выйти</button>
                </div>
              )}
            </div>
          ) : (
            <div className="header__auth">
              <button
                className="theme-icon"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
                title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              >
                {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <Link to="/login" className="header__login">Войти</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Регистрация</Link>
            </div>
          )}

          <button
            className="header__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <Close size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
