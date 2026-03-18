import React, { useState, useEffect } from "react";
import { X, Settings, Check } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const rejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    const consent = {
      necessary: preferences.necessary,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Cannot disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Close button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 md:relative md:top-0 md:right-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cookie consent"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Mes naudojame slapukus
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Mes naudojame slapukus savo svetainėje, kad galėtume pagerinti jūsų patirtį, analizuoti lankytojų srautus ir personalizuoti turinį bei reklamas. 
              Paspaudę "Priimti visus", sutinkate su visomis slapukų kategorijomis.
            </p>
            <a
              href="/slapuku-politika"
              className="text-red-600 hover:text-red-700 text-sm underline"
            >
              Sužinokite daugiau apie slapukų politiką
            </a>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={acceptAll}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap touch-manipulation min-h-[48px]"
              aria-label="Accept all cookies"
            >
              Priimti visus
            </button>
            <button
              onClick={rejectAll}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap touch-manipulation min-h-[48px]"
              aria-label="Reject all cookies"
            >
              Atmesti visus
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
              aria-label="Customize cookie preferences"
            >
              <Settings className="w-4 h-4" />
              Parinktys
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Slapukų Parinktys
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close preferences"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Būtini slapukai
                      </h4>
                      <p className="text-sm text-gray-600">
                        Šie slapukai yra būtini svetainės veikimui ir negali būti išjungti
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Visada įjungti
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Analitikos slapukai
                      </h4>
                      <p className="text-sm text-gray-600">
                        Padėkite mums suprasti, kaip lankytojai naudoja svetainę
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference("analytics")}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        preferences.analytics ? "bg-green-600" : "bg-gray-300"
                      } touch-manipulation min-h-[44px]`}
                      aria-label="Toggle analytics cookies"
                      role="switch"
                      aria-checked={preferences.analytics}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.analytics ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Rinkodaros slapukai
                      </h4>
                      <p className="text-sm text-gray-600">
                        Naudojami personalizuotiems reklamoms ir markavimui
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference("marketing")}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        preferences.marketing ? "bg-green-600" : "bg-gray-300"
                      } touch-manipulation min-h-[44px]`}
                      aria-label="Toggle marketing cookies"
                      role="switch"
                      aria-checked={preferences.marketing}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.marketing ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors touch-manipulation min-h-[48px]"
                >
                  Atšaukti
                </button>
                <button
                  onClick={savePreferences}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors touch-manipulation min-h-[48px]"
                >
                  Išsaugoti Parinktis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;


