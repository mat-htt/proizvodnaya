import React, { useEffect, useRef, useState } from 'react';

// Живая иллюстрация на главной: точка бежит по кривой, касательная показывает f′(x₀).
// Наведите курсор на график — точка последует за ним.

const f = (x) => 0.1 * x ** 3 - 0.75 * x ** 2 + 1.2 * x + 2;
const df = (x) => 0.3 * x ** 2 - 1.5 * x + 1.2;

const W = 480;
const H = 320;
const X_MIN = -1;
const X_MAX = 6;
const Y_MIN = -0.5;
const Y_MAX = 4.5;
const PAD = 28;

const sx = (x) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD * 2);
const sy = (y) => H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD * 2);
const toX = (px) => X_MIN + ((px - PAD) / (W - PAD * 2)) * (X_MAX - X_MIN);

const curvePath = (() => {
  let d = '';
  for (let i = 0; i <= 140; i++) {
    const x = X_MIN + (i / 140) * (X_MAX - X_MIN);
    d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`;
  }
  return d;
})();

const TangentGraph = () => {
  const [x0, setX0] = useState(2.4);
  const hovering = useRef(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      if (!hovering.current) setX0(2.5 + 3 * Math.sin((now - start) / 2600));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    hovering.current = true;
    setX0(Math.min(5.6, Math.max(-0.6, toX(px))));
  };

  const y0 = f(x0);
  const k = df(x0);
  const span = 1.3;
  const rising = k >= 0;

  return (
    <div className="tangent-card">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="tangent-card__svg"
        onPointerMove={onMove}
        onPointerLeave={() => { hovering.current = false; }}
        role="img"
        aria-label="График функции и касательная к нему"
      >
        {[0, 1, 2, 3, 4, 5].map(x => (
          <line key={`vx${x}`} x1={sx(x)} x2={sx(x)} y1={PAD} y2={H - PAD} className="tg-grid" />
        ))}
        {[0, 1, 2, 3, 4].map(y => (
          <line key={`hy${y}`} x1={PAD} x2={W - PAD} y1={sy(y)} y2={sy(y)} className="tg-grid" />
        ))}
        <line x1={PAD} x2={W - PAD} y1={sy(0)} y2={sy(0)} className="tg-axis" />
        <line x1={sx(0)} x2={sx(0)} y1={PAD} y2={H - PAD} className="tg-axis" />

        {/* Экстремумы: f′(x) = 0 при x = 1 и x = 4 */}
        {[1, 4].map(x => (
          <g key={`ext${x}`}>
            <line x1={sx(x)} x2={sx(x)} y1={sy(f(x))} y2={sy(0)} className="tg-guide" />
            <circle cx={sx(x)} cy={sy(f(x))} r="3.5" className="tg-ext" />
          </g>
        ))}

        <path d={curvePath} className="tg-curve" />

        <line
          x1={sx(x0 - span)} y1={sy(y0 - k * span)}
          x2={sx(x0 + span)} y2={sy(y0 + k * span)}
          className={`tg-tangent ${rising ? 'is-up' : 'is-down'}`}
        />
        <line x1={sx(x0)} x2={sx(x0)} y1={sy(y0)} y2={sy(0)} className="tg-guide" />
        <circle cx={sx(x0)} cy={sy(y0)} r="11" className={`tg-halo ${rising ? 'is-up' : 'is-down'}`} />
        <circle cx={sx(x0)} cy={sy(y0)} r="5.5" className={`tg-point ${rising ? 'is-up' : 'is-down'}`} />
      </svg>

      <div className="tangent-card__stats">
        <div>
          <span>x₀</span>
          <strong>{x0.toFixed(2)}</strong>
        </div>
        <div>
          <span>f′(x₀)</span>
          <strong>{k >= 0 ? '+' : '−'}{Math.abs(k).toFixed(2)}</strong>
        </div>
        <div>
          <span>функция</span>
          <strong className={rising ? 'is-up' : 'is-down'}>{Math.abs(k) < 0.05 ? 'экстремум' : rising ? 'возрастает' : 'убывает'}</strong>
        </div>
      </div>
    </div>
  );
};

export default TangentGraph;
