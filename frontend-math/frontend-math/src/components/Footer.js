import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      {/* Блок с логотипом и описанием */}
      <div className="footer-brand">
        <div className="footer-title">
          <span style={{color: '#b7e4c7'}}>∑</span> MathBase
        </div>
        <p>
          Интерактивная платформа для глубокого изучения производных и математического анализа.
          Делаем сложные темы доступными для каждого студента.
        </p>
      </div>

      {/* Навигация */}
      <div className="footer-section">
        <h4 className="footer-section-title">Обучение</h4>
        <div className="footer-links">
          <Link to="/" className="footer-link">Все темы</Link>
          <Link to="/teacher" className="footer-link">Для учителей</Link>
          <a href="#resources" className="footer-link">Материалы</a>
        </div>
      </div>

      {/* Поддержка и правовая информация */}
      <div className="footer-section">
        <h4 className="footer-section-title">Поддержка</h4>
        <div className="footer-links">
          <a href="#contact" className="footer-link">Связаться с нами</a>
          <a href="#privacy" className="footer-link">Конфиденциальность</a>
          <a href="#terms" className="footer-link">Условия использования</a>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <p className="footer-copyright">
        © {new Date().getFullYear()} MathBase. Все права защищены. Разработано для курса «Производная».
      </p>
    </div>
  </footer>
);

export default Footer;