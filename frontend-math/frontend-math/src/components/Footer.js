import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import '../css/Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>Курс по производной: лекции, задачи и контрольная работа.</p>
        </div>

        <nav className="footer__col" aria-label="Обучение">
          <h4>Обучение</h4>
          <Link to="/">Программа курса</Link>
          <Link to="/tests">Тесты и контрольная</Link>
          <Link to="/resources">Материалы</Link>
        </nav>

        <nav className="footer__col" aria-label="Поддержка">
          <h4>Поддержка</h4>
          <Link to="/contact">Связаться с нами</Link>
          <Link to="/privacy">Конфиденциальность</Link>
          <Link to="/terms">Условия использования</Link>
        </nav>
      </div>

      <div className="footer__bottom">© {new Date().getFullYear()} MathBase</div>
    </div>
  </footer>
);

export default Footer;
