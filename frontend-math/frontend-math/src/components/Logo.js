import React from 'react';
import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 36 }) => (
  <span className="logo__mark" style={{ width: size, height: size, fontSize: size * 0.6 }} aria-hidden="true">∑</span>
);

const Logo = ({ onClick }) => (
  <Link to="/" className="logo" onClick={onClick} aria-label="MathBase — на главную">
    <LogoMark />
    <span className="logo__text">MathBase</span>
  </Link>
);

export default Logo;
