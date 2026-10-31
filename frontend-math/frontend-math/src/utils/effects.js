import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Плавное появление элементов с классом .reveal при прокрутке.
// Следит и за элементами, которые появляются позже (например, после загрузки данных).
export const useRevealOnScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const observeAll = () => document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
};

// «Прожектор»: подсветка карточки .spotlight там, где находится курсор
export const useSpotlight = () => {
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.('.spotlight');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
};

// Число, которое «досчитывает» до значения, когда попадает в зону видимости
export const useCountUp = (target, duration = 1200) => {
  const ref = useRef(null);
  const [value, setValue] = useState(reducedMotion() ? target : 0);

  useEffect(() => {
    if (reducedMotion() || !ref.current || !('IntersectionObserver' in window)) {
      setValue(target);
      return undefined;
    }
    let frame;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration]);

  return [ref, value];
};
