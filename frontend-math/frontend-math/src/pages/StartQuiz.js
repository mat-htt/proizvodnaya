import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Точка входа по QR-коду: /start?tests=11,12,13,14 — выдаём случайный вариант
const StartQuiz = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ids = (params.get('tests') || '').split(',').filter(id => /^\d+$/.test(id));
    if (ids.length === 0) {
      navigate('/tests', { replace: true });
      return;
    }
    const pick = ids[Math.floor(Math.random() * ids.length)];
    navigate(`/quiz/${pick}`, { replace: true });
  }, [params, navigate]);

  return null;
};

export default StartQuiz;
