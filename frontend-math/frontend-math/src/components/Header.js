import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header style={{ background: '#2e7d32', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between' }}>
    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>MathBase</Link>
    <nav>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Темы</Link>
    </nav>
  </header>
);

export default Header;