import React from 'react';
import '../css/Auth.css';

// Общая раскладка для входа и регистрации: слева форма, справа брендовый блок
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth container">
    <div className="auth__form">
      <h1>{title}</h1>
      <p className="auth__subtitle">{subtitle}</p>
      {children}
      <div className="auth__footer">{footer}</div>
    </div>

    <aside className="auth__aside" aria-hidden="true">
      <p className="auth__big">f′(x)</p>
      <p>Лекции, задачи и итоговое тестирование по производной — результаты сохраняются в профиле.</p>
    </aside>
  </div>
);

export default AuthLayout;
