import React from 'react';
import '../css/Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-bg-animation"></div> {/* Фоновая магия */}

      <div className="contact-container">
        {/* Декоративный заголовок в стиле терминала */}
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="close"></span>
            <span className="minimize"></span>
            <span className="maximize"></span>
          </div>
          <div className="terminal-title">contact_v2.1.exe</div>
        </div>

        <div className="contact-content">
          <div className="contact-text">
            <h1 className="glitch-text" data-text="> На связи">
              > На связи <span className="cursor">|</span>
            </h1>
            <p>
              Есть вопросы по оформлению материала, нашли баг в формулах производных или хотите предложить коллаборацию?
            </p>
            <p className="sub-text">
              Выберите удобный канал связи. Я обычно отвечаю быстрее, чем вычисляется сложный интеграл.
            </p>
          </div>

          <div className="contact-cards">
            {/* Карточка Telegram */}
            <a href="https://t.me/mt_voyt" target="_blank" rel="noopener noreferrer" className="contact-card tg-card">
              <div className="card-overlay"></div>
              <div className="card-icon">
                {/* SVG иконка Telegram */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="card-info">
                <h3>Telegram</h3>
                <p>@mt_voyt</p>
                <span className="card-action">Написать -></span>
              </div>
            </a>

            {/* Карточка GitHub */}
            <a href="https://github.com/mat-htt" target="_blank" rel="noopener noreferrer" className="contact-card gh-card">
              <div className="card-overlay"></div>
              <div className="card-icon">
                {/* SVG иконка GitHub */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </div>
              <div className="card-info">
                <h3>GitHub</h3>
                <p>mat-htt / разработчик</p>
                <span className="card-action">Смотреть код -></span>
              </div>
            </a>
          </div>
        </div>

        {/* Маленький "пасхальный" элемент снизу */}
        <div className="contact-footer">
          <code>status: <span className="status-online">online</span> *** ping: <span id="ping">14ms</span></code>
        </div>
      </div>
    </div>
  );
};

export default Contact;