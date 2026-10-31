import React, { createContext, useCallback, useContext, useState } from 'react';
import { Check, Cross } from './Icons';
import '../css/Toast.css';

// Ненавязчивые уведомления вместо alert()
const ToastContext = createContext(() => {});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list, { id, message, type }]);
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">{t.type === 'error' ? <Cross size={16} /> : <Check size={16} />}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
