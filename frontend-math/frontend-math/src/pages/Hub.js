import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TopicCard from '../components/TopicCard';
import TangentGraph from '../components/TangentGraph';
import { ArrowRight } from '../components/Icons';
import { plural } from '../utils/format';
import { useCountUp } from '../utils/effects';
import '../css/Hub.css';

const STEPS = [
  { tone: 'lime', title: 'Лекции с формулами', text: 'От определения производной до исследования функций — с графиками и разобранными примерами.' },
  { tone: 'dark', title: 'Мгновенная проверка', text: 'Ответ можно ввести дробью или десятичной: «-1/25» и «-0,04» засчитаются одинаково.' },
  { tone: 'white', title: 'Разбор ошибок', text: 'После отправки — правильный ответ к каждой задаче и история всех попыток.' },
  { tone: 'glass', title: 'Рейтинг в эфире', text: 'На выступлении участники сканируют QR-код, а таблица лидеров обновляется на экране.' },
];

const FORMULAS = [
  "(xⁿ)′ = n·xⁿ⁻¹", "(sin x)′ = cos x", "(cos x)′ = −sin x", "(eˣ)′ = eˣ", "(ln x)′ = 1/x",
  "(u·v)′ = u′v + uv′", "(u/v)′ = (u′v − uv′)/v²", "(√x)′ = 1/(2√x)", "f(g(x))′ = f′(g)·g′", "k = tg α",
];

// Крупная цифра, которая «досчитывает» при появлении на экране
const Count = ({ value, suffix = '' }) => {
  const [ref, current] = useCountUp(value);
  return <strong ref={ref}>{current}{suffix}</strong>;
};

const Hub = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lectures/')
      .then(res => setLectures(res.data))
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  }, []);

  const first = lectures[0];
  const startLink = first ? `/topic/${first.slug}` : '/#program';

  return (
    <div className="hub container">
      {/* ---------- Первый экран ---------- */}
      <section className="hero">
        <div className="hero__copy">
          <span className="tag">Курс по математическому анализу</span>
          <h1 className="hero__title">
            Производная <span className="mark">без зубрёжки</span>
          </h1>
          <p className="hero__lead">
            Лекции с графиками, задачи из мира IT и итоговое тестирование,
            которое проверяется сразу после отправки.
          </p>
          <div className="hero__cta">
            <Link to={startLink} className="btn btn--primary btn--lg btn--arrow">Начать обучение <ArrowRight size={18} /></Link>
            <Link to="/tests" className="hero__secondary">
              <span className="round-arrow"><ArrowRight size={18} /></span>
              Итоговое тестирование
            </Link>
          </div>
          <ul className="hero__pills">
            <li>Лекции</li><li>Формулы</li><li>Тесты</li><li>Разбор ошибок</li><li>Рейтинг</li>
          </ul>
        </div>

        <div className="hero__visual">
          <div className="hero__sphere" aria-hidden="true" />
          <div className="hero__board">
            <TangentGraph />
          </div>
          <div className="hero__chip hero__chip--top glass">
            <strong>f′(x) = 0</strong>
            <span>в точках экстремума</span>
          </div>
          <div className="hero__chip hero__chip--bottom glass">
            <span className="hero__dot" />
            <span>Наведите курсор на график</span>
          </div>
        </div>
      </section>

      {/* ---------- Цифры ---------- */}
      <section className="numbers glass reveal">
        <div><Count value={lectures.length || 7} /><span>{plural(lectures.length || 7, 'лекция', 'лекции', 'лекций')}</span></div>
        <div><Count value={4} /><span>варианта итогового теста</span></div>
        <div><Count value={40} /><span>прикладных задач</span></div>
        <div><Count value={60} suffix="%" /><span>чтобы сдать тест</span></div>
      </section>

      {/* ---------- Бегущая строка формул ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...FORMULAS, ...FORMULAS].map((f, i) => <span key={i}>{f}</span>)}
        </div>
      </div>

      {/* ---------- Как устроен курс ---------- */}
      <section className="section">
        <div className="section__head reveal">
          <span className="tag">Как это работает</span>
          <h2 className="section-title">Всё для того, чтобы <span className="mark">понять</span>, а не запомнить</h2>
        </div>
        <div className="bento">
          {STEPS.map((step, i) => (
            <article
              key={step.title}
              className={`bento__card bento__card--${step.tone}${step.tone === 'glass' ? ' glass' : ''} reveal spotlight`}
              style={{ '--reveal-delay': `${i * 90}ms` }}
            >
              <div className="bento__top">
                <span className="bento__num">0{i + 1}</span>
                <span className="round-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Программа ---------- */}
      <section className="section" id="program">
        <div className="section__head section__head--row reveal">
          <div>
            <span className="tag">Программа курса</span>
            <h2 className="section-title">Шаг за шагом</h2>
          </div>
          {first && <Link to={startLink} className="btn">С первой лекции <ArrowRight size={16} /></Link>}
        </div>
        <div className="program__grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton program__skeleton" />)
            : lectures.map((l, i) => (
              <TopicCard
                key={l.id}
                index={i}
                slug={l.slug}
                title={l.title}
                image={l.image_url}
                hasTest={Boolean(l.related_test)}
              />
            ))}
        </div>
        {!loading && lectures.length === 0 && (
          <div className="state card"><h3>Лекции пока не добавлены</h3><p>Проверьте, что сервер Django запущен.</p></div>
        )}
      </section>

      {/* ---------- Итоговое тестирование ---------- */}
      <section className="exam reveal">
        <span className="exam__watermark" aria-hidden="true">f′(x)</span>
        <div className="exam__copy">
          <span className="tag">Итоговая проверка</span>
          <h2>Итоговое тестирование по производной</h2>
          <p>
            Скорость роста базы данных, касательная к траектории курсора, оптимальное число воркеров —
            10 задач, где производная отвечает на реальные вопросы.
          </p>
          <div className="exam__actions">
            <Link to="/tests" className="btn btn--dark btn--lg">Выбрать вариант <ArrowRight size={18} /></Link>
            {!user.isLoggedIn && <Link to="/register" className="exam__link">Создать аккаунт</Link>}
          </div>
        </div>

        <div className="exam__card">
          <div className="exam__card-head">
            <span>Варианты</span>
            <span className="exam__badge">10 задач</span>
          </div>
          <div className="exam__variants">
            {[1, 2, 3, 4].map(n => (
              <Link key={n} to="/tests" className="exam__variant">
                <small>Вариант</small>
                <strong>{n}</strong>
              </Link>
            ))}
          </div>
          <p className="exam__note">Система может выдать случайный вариант — удобно для класса.</p>
        </div>
      </section>
    </div>
  );
};

export default Hub;
