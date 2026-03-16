import React from 'react';
import '../css/Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-title">MathBase — Платформа по изучению производных</div>
    <div className="footer-links">
      <a href="#about" className="footer-link">О проекте</a>
      <a href="#contact" className="footer-link">Поддержка</a>
      <a href="#privacy" className="footer-link">Конфиденциальность</a>
    </div>
    <p className="footer-copyright">© 2026 Все права защищены.</p>
  </footer>
);

export default Footer;