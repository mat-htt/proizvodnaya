import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#ffffff',
    color: '#2e7d32', // Твой основной зеленый
    padding: '30px 20px',
    textAlign: 'center',
    borderTop: '1px solid #e8f5e9',
    marginTop: 'auto', // Магия флексбокса: прижимает футер к низу
  };

  const linkStyle = {
    color: '#4caf50',
    textDecoration: 'none',
    margin: '0 10px',
    fontSize: '14px'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        MathBase — Платформа по изучению производных
      </div>
      <div style={{ marginBottom: '15px' }}>
        <a href="#about" style={linkStyle}>О проекте</a>
        <a href="#contact" style={linkStyle}>Поддержка</a>
        <a href="#privacy" style={linkStyle}>Конфиденциальность</a>
      </div>
      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
        © 2026 Все права защищены. Сделано для подготовки к экзаменам.
      </p>
    </footer>
  );
};

export default Footer;