import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';

const STORAGE_KEY = 'splashzone-email-popup-seen';

interface EmailCapturePopupProps {
  onSubscribe?: (email: string) => Promise<void>;
  delayMs?: number;
}

export function EmailCapturePopup({ onSubscribe, delayMs = 12000 }: EmailCapturePopupProps) {
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, [show]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setMessage('Įveskite galiojantį el. paštą.');
      return;
    }
    setStatus('loading');
    try {
      if (onSubscribe) {
        await onSubscribe(trimmed);
      }
      setStatus('success');
      setMessage('Ačiū! Prenumerata sėkminga.');
      setTimeout(handleClose, 2500);
    } catch {
      setStatus('error');
      setMessage('Klaida. Bandykite vėliau.');
    }
  };

  return (
    <>
      {show && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 pb-8 sm:pb-4">
          <div className="absolute inset-0 bg-black/30" aria-hidden onClick={handleClose} />
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-brand-blue text-white p-6 ${entered ? 'popup-enter-end' : 'popup-enter-start'}`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition"
              aria-label="Uždaryti"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3 pr-10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Sužinokite pirmi!</h3>
                <p className="text-sm text-white/90 mb-4">
                  Užsiprenumeruokite ir gaukite naujienas apie akcijas bei naujausius pasiūlymus tiesiai į el. paštą.
                </p>
                {status === 'success' ? (
                  <p className="text-sm font-medium text-white/95">{message}</p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="El. paštas"
                      className="w-full px-4 py-3 rounded-lg text-brand-text placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50"
                      disabled={status === 'loading'}
                      autoComplete="email"
                    />
                    {message && (
                      <p className={`text-sm ${status === 'error' ? 'text-red-200' : 'text-white/90'}`}>
                        {message}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-3 rounded-lg transition min-h-[48px] disabled:opacity-70"
                    >
                      {status === 'loading' ? 'Siunčiama...' : 'Prenumeruoti'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
