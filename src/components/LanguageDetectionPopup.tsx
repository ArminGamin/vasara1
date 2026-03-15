import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const STORAGE_KEY = 'splashzone-lang-prompt';

type Lang = 'lt' | 'en';

interface LanguageDetectionPopupProps {
  onChooseLanguage: (lang: Lang) => void;
  currentLang: Lang;
}

/** Detects likely region (LT vs US/UK) and shows a one-time prompt to switch to Lithuanian. Never forces redirect. */
export function LanguageDetectionPopup({ onChooseLanguage, currentLang }: LanguageDetectionPopupProps) {
  const [show, setShow] = useState(false);
  const [detected, setDetected] = useState<Lang | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const alreadyDecided = localStorage.getItem(STORAGE_KEY);
    if (alreadyDecided) return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const looksLikeLT = /Europe\/Vilnius/i.test(tz) || (typeof navigator !== 'undefined' && navigator.language?.startsWith('lt'));
    const looksLikeEN = /America|Europe\/London|en(-|$)/i.test(tz) || (typeof navigator !== 'undefined' && /^en\b/.test(navigator.language || ''));

    if (looksLikeLT && currentLang !== 'lt') {
      setDetected('lt');
      setShow(true);
    } else if (looksLikeEN && currentLang !== 'en') {
      setDetected('en');
    }
  }, [currentLang]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, [show]);

  const handleChoose = (lang: Lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setShow(false);
    onChooseLanguage(lang);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, currentLang);
    setShow(false);
  };

  return (
    <>
      {show && detected === 'lt' && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-8 sm:pb-4">
          <div className="absolute inset-0 bg-black/20" aria-hidden onClick={handleDismiss} />
          <div
            className={`relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 ${entered ? 'popup-enter-end' : 'popup-enter-start'}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-brand-text mb-1">
                  We noticed you&apos;re in Lithuania. View site in Lithuanian?
                </h3>
                <p className="text-sm text-brand-muted mb-4">
                  You can switch language anytime from the header.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChoose('lt')}
                    className="flex-1 bg-brand-blue-deep text-white py-2.5 px-4 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Lietuvių
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 border border-gray-300 text-brand-muted py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Keep English
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
