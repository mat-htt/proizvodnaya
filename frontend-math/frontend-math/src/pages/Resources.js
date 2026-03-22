import React from 'react';
import '../css/Resources.css';

const Resources = () => {
  const resourceList = [
    {
      id: 1,
      title: "Единый образовательный ресурс",
      description: "Государственная платформа с учебными материалами, видеоуроками и тестами по всем школьным предметам, включая высшую математику.",
      link: "https://eior.by/",
      category: "Гос. ресурс",
      icon: "📚"
    },
    {
      id: 2,
      title: "Lingvanex & Справочники",
      description: "Инструменты для перевода технической литературы и доступа к международным математическим базам данных.",
      link: "https://lingvanex.com/", // Упростил твою длинную рекламную ссылку
      category: "Инструменты",
      icon: "🌐"
    },
    {
      id: 3,
      title: "Графический калькулятор Desmos",
      description: "Визуализируйте производные и функции в реальном времени. Незаменимый инструмент для матанализа.",
      link: "https://www.desmos.com/calculator",
      category: "Практика",
      icon: "📈"
    }
  ];

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>Полезные ресурсы</h1>
        <p>Мы отобрали лучшие платформы, которые помогут вам в изучении математики и за её пределами.</p>
      </div>

      <div className="resources-grid">
        {resourceList.map(item => (
          <div key={item.id} className="resource-card">
            <div className="resource-icon">{item.icon}</div>
            <div className="resource-category">{item.category}</div>
            <h3 className="resource-title">{item.title}</h3>
            <p className="resource-description">{item.description}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="resource-button">
              Перейти к ресурсу
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y3="3"></line>
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;