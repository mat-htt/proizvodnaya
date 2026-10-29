import React from 'react';
import { External } from '../components/Icons';
import '../css/Resources.css';

const resourceList = [
  {
    id: 1,
    title: "Единый образовательный ресурс",
    description: "Государственная платформа с учебными материалами, видеоуроками и тестами по всем школьным предметам, включая высшую математику.",
    link: "https://eior.by/",
    category: "Гос. ресурс"
  },
  {
    id: 2,
    title: "Lingvanex & справочники",
    description: "Инструменты для перевода технической литературы и доступа к международным математическим базам данных.",
    link: "https://lingvanex.com/",
    category: "Инструменты"
  },
  {
    id: 3,
    title: "Графический калькулятор Desmos",
    description: "Визуализируйте производные и функции в реальном времени. Незаменимый инструмент для матанализа.",
    link: "https://www.desmos.com/calculator",
    category: "Практика"
  }
];

const Resources = () => (
  <div className="page">
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Полезные ресурсы</h1>
        <p className="page-lead">Платформы, которые помогут в изучении математики и за её пределами.</p>
      </header>

      <div className="resources">
        {resourceList.map(({ id, title, description, link, category }) => (
          <a key={id} href={link} target="_blank" rel="noopener noreferrer" className="resource">
            <span className="badge">{category}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="resource__link">
              {new URL(link).hostname.replace('www.', '')} <External size={14} />
            </span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default Resources;
