import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';
import { Maximize, Refresh } from '../components/Icons';
import { plural } from '../utils/format';
import '../css/LivePage.css';

const STORAGE_KEY = 'live-session';
const POLL_MS = 4000;

const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
};

const isLocalHost = (host) => ['localhost', '127.0.0.1', '[::1]'].includes(host);

// Режим конференции: QR-код на тест и рейтинг, который обновляется сам
const LivePage = () => {
  const [tests, setTests] = useState([]);
  const [session, setSession] = useState(loadSession);
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [board, setBoard] = useState({ participants: 0, rows: [] });
  const [forbidden, setForbidden] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    api.get('/tests/')
      .then(res => setTests(res.data))
      .catch(err => { if (err.response?.status === 403) setForbidden(true); });

    // Если сайт открыт как localhost, телефоны его не увидят — подставляем IP компьютера в сети
    if (isLocalHost(window.location.hostname)) {
      api.get('/network-info/')
        .then(res => {
          if (res.data.lan_ip) setBaseUrl(`${window.location.protocol}//${res.data.lan_ip}:${window.location.port || 80}`);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (e) { /* нет доступа */ }
  }, [session]);

  // Что можно вывести на экран: итоговое тестирование целиком (все варианты) или отдельный тест
  const options = useMemo(() => {
    const series = {};
    const single = [];
    tests.forEach(t => {
      if (t.series) (series[t.series] = series[t.series] || []).push(t.id);
      else single.push({ key: `t${t.id}`, label: t.title, ids: [t.id] });
    });
    return [
      ...Object.entries(series).map(([name, ids]) => ({ key: `s${name}`, label: `${name} — все варианты`, ids })),
      ...single,
    ];
  }, [tests]);

  const selected = options.find(o => o.key === session.key) || options[0];

  const loadBoard = useCallback(() => {
    if (!selected) return;
    const params = new URLSearchParams({ tests: selected.ids.join(',') });
    if (session.since) params.set('since', session.since);
    api.get(`/leaderboard/?${params}`)
      .then(res => setBoard(res.data))
      .catch(err => console.error('Ошибка загрузки рейтинга:', err));
  }, [selected, session.since]);

  useEffect(() => {
    loadBoard();
    const timer = setInterval(loadBoard, POLL_MS);
    return () => clearInterval(timer);
  }, [loadBoard]);

  const startSession = () => setSession(s => ({ ...s, since: new Date().toISOString() }));
  const enterFullscreen = () => stageRef.current?.requestFullscreen?.();

  if (forbidden) return <div className="state"><h3>Раздел доступен только учителям</h3><Link to="/" className="btn">На главную</Link></div>;

  const joinUrl = selected ? `${baseUrl.replace(/\/$/, '')}/start?tests=${selected.ids.join(',')}` : '';
  const shortUrl = joinUrl.replace(/^https?:\/\//, '');

  return (
    <div className="page">
      <div className="container">
        <header className="page-head page-head__row">
          <div>
            <h1 className="page-title">Эфир</h1>
            <p className="page-lead">Выведите эту страницу на проектор: участники сканируют QR-код, решают тест на телефоне, а рейтинг обновляется сам.</p>
          </div>
        </header>

        <div className="live__controls">
          <div className="field">
            <label className="label" htmlFor="live-test">Что проходим</label>
            <select
              id="live-test"
              className="select"
              value={selected?.key || ''}
              onChange={e => setSession(s => ({ ...s, key: e.target.value }))}
            >
              {options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="live-url">Адрес сайта для телефонов</label>
            <input id="live-url" className="input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
          </div>
          <div className="live__buttons">
            <button className="btn btn--primary" onClick={startSession}><Refresh size={18} /> Новая сессия</button>
            <button className="btn" onClick={enterFullscreen}><Maximize size={18} /> На весь экран</button>
          </div>
        </div>
        <p className="hint live__hint">
          {session.since
            ? `В рейтинге — попытки с ${new Date(session.since).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}. «Новая сессия» обнулит таблицу.`
            : 'Сейчас в рейтинге все попытки за всё время. Нажмите «Новая сессия» перед началом выступления.'}
          {' '}Телефоны и компьютер должны быть в одной Wi-Fi сети.
        </p>

        <section className="live" ref={stageRef}>
          <div className="live__join">
            <div className="live__qr">
              {joinUrl && <QRCodeSVG value={joinUrl} size={512} level="M" fgColor="#1b4332" bgColor="#ffffff" style={{ width: '100%', height: 'auto' }} />}
            </div>
            <p className="live__scan">Наведите камеру телефона</p>
            <p className="live__url">{shortUrl}</p>
          </div>

          <div className="live__board">
            <div className="live__board-head">
              <h2>Рейтинг</h2>
              <span className="live__count">{board.participants} {plural(board.participants, 'участник', 'участника', 'участников')}</span>
            </div>

            {board.rows.length === 0 ? (
              <div className="live__empty">Ждём первых результатов…</div>
            ) : (
              <ol className="live__list">
                {board.rows.slice(0, 10).map((row, i) => (
                  <li key={row.name} className={`live__row${i < 3 ? ` live__row--top${i + 1}` : ''}`}>
                    <span className="live__place">{i + 1}</span>
                    <span className="live__name">
                      {row.name}
                      {row.group && <small>{row.group}</small>}
                    </span>
                    <span className="live__score">{row.score}%</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LivePage;
