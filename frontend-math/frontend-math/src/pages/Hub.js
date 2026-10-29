import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TopicCard from '../components/TopicCard';
import TangentGraph from '../components/TangentGraph';
import { ArrowRight } from '../components/Icons';
import { plural } from '../utils/format';
import '../css/Hub.css';

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

  return (
    <div className="hub container">
      {/* ---------- Баннер ---------- */}
      <section className="hero">
        <div className="hero__copy">
          <h1 className="hero__title">Производная без зубрёжки</h1>
          <p className="hero__lead">
            {lectures.length ? `${lectures.length} ${plural(lectures.length, 'лекция', 'лекции', 'лекций')}` : 'Лекции'} с
            графиками, задачи из IT и контрольная, которая проверяется сразу
          </p>
          <div className="hero__cta">
            {first
              ? <Link to={`/topic/${first.slug}`} className="btn btn--mint btn--lg">Начать с первой лекции</Link>
              : <a href="#program" className="btn btn--mint btn--lg">Начать с первой лекции</a>}
            <Link to="/tests" className="btn btn--on-dark btn--lg">Контрольная</Link>
          </div>
        </div>
        <div className="hero__graph">
          <TangentGraph />
        </div>
      </section>

      {/* ---------- Как устроен курс ---------- */}
      <section className="steps">
        <div className="step">
          <span className="step__num">1</span>
          <h3>Читаете лекцию</h3>
          <p>Определение, правила, геометрический смысл и исследование функций — с картинками и разбором.</p>
        </div>
        <div className="step">
          <span className="step__num">2</span>
          <h3>Решаете тест</h3>
          <p>Ответ можно ввести дробью или десятичной — «-1/25» и «-0,04» засчитаются одинаково.</p>
        </div>
        <div className="step">
          <span className="step__num">3</span>
          <h3>Видите ошибки</h3>
          <p>После отправки — правильный ответ к каждой задаче и история всех попыток.</p>
        </div>
      </section>

      {/* ---------- Программа ---------- */}
      <section className="program" id="program">
        <h2 className="section-title">Программа курса</h2>
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

      {/* ---------- Контрольная ---------- */}
      <section className="exam">
        <div className="exam__copy">
          <h2>Контрольная работа</h2>
          <p>
            Скорость роста базы данных, касательная к траектории курсора, оптимальное число воркеров —
            10 задач, где производная решает реальные вопросы.
          </p>
          <Link to="/tests" className="btn btn--primary btn--lg">
            Выбрать вариант <ArrowRight size={18} />
          </Link>
          {!user.isLoggedIn && <p className="exam__note">Чтобы результат сохранился, <Link to="/register">зарегистрируйтесь</Link>.</p>}
        </div>
        <dl className="exam__facts">
          <div><dt>4</dt><dd>варианта</dd></div>
          <div><dt>10</dt><dd>задач в каждом</dd></div>
          <div><dt>60%</dt><dd>чтобы сдать</dd></div>
        </dl>
      </section>
    </div>
  );
};

export default Hub;
