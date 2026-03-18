import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  email: string;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  email,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Užsakymas Patvirtintas!
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Dėkojame už pirkinį. Jūsų užsakymo numeris:
          </p>

          {/* Order Number */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-mono font-bold text-gray-900 break-all">
              {orderNumber}
            </p>
          </div>

          {/* Email Confirmation */}
          <p className="text-sm text-gray-600 mb-8">
            Išsiuntėme patvirtinimo laišką į{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          {/* Continue Shopping Button */}
          <button
            onClick={onClose}
            className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
          >
            Tęsti Apsipirkimą
          </button>
        </div>
      </div>
    </div>
  );
};
