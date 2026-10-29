import React from 'react';
import { Telegram, Github, ArrowRight } from '../components/Icons';
import '../css/Contact.css';

const CHANNELS = [
  { title: 'Telegram', handle: '@mt_voyt', note: 'Быстрее всего — ответ обычно в течение дня', href: 'https://t.me/mt_voyt', icon: Telegram, action: 'Написать' },
  { title: 'GitHub', handle: 'mat-htt', note: 'Исходный код проекта и баг-репорты', href: 'https://github.com/mat-htt', icon: Github, action: 'Открыть профиль' },
];

const Contact = () => (
  <div className="page">
    <div className="container container--narrow">
      <header className="page-head">
        <h1 className="page-title">Связаться с нами</h1>
        <p className="page-lead">
          Есть вопросы по материалу, нашли ошибку в формулах или хотите предложить сотрудничество?
          Выберите удобный канал связи.
        </p>
      </header>

      <div className="contact">
        {CHANNELS.map(({ title, handle, note, href, icon: Icon, action }) => (
          <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="contact__card">
            <span className="contact__icon"><Icon size={24} /></span>
            <div className="contact__body">
              <h3>{title}</h3>
              <p>{handle}</p>
              <small>{note}</small>
            </div>
            <span className="contact__action">{action} <ArrowRight size={16} /></span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default Contact;
