import React from 'react';
import { Link } from 'react-router-dom';

// Логотип MathBase — тот же значок Σ, что и в презентации проекта
export const LogoMark = ({ size = 38 }) => (
  <img src="/logo.png" alt="" width={size} height={size} className="logo__mark" />
);

const Logo = ({ onClick }) => (
  <Link to="/" className="logo" onClick={onClick} aria-label="MathBase — на главную">
    <LogoMark />
    <span className="logo__text">MathBase</span>
  </Link>
);

export default Logo;
