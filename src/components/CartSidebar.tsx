import React from 'react';
import { X, ShoppingCart, Clock, Gift, Lock, Trash2 } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  totalItems: number;
  totalPrice: number;
  urgencyTimer: { hours: number; minutes: number; seconds: number };
  giftWrapping: boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  onCheckout: () => void;
  translations: any;
  upsellSlot?: React.ReactNode;
}

export const CartSidebar = React.memo(({
  isOpen,
  onClose,
  cartItems,
  totalItems,
  totalPrice,
  urgencyTimer,
  giftWrapping,
  updateQuantity,
  removeItem,
  onCheckout,
  translations: t,
  upsellSlot
}: CartSidebarProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto relative">
        {/* Decorative background only for empty cart */}
        {totalItems === 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: '#f8fafc',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%23e2e8f0' stroke-width='1.2' opacity='0.55' stroke-linecap='round'%3E%3Cpath d='M24 3v42M3 24h42M9 9l30 30M39 9L9 39'/%3E%3C/g%3E%3C/svg%3E"), linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(254,242,242,0.85) 55%, rgba(255,255,255,0) 100%)`,
              backgroundRepeat: 'repeat, no-repeat',
            }}
          />
        )}
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Krepšelis • {totalItems}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {totalItems > 0 && (
            <>
              <div className="bg-brand-bg-alt p-4 rounded-lg mb-6">
                <p className="text-sm font-medium mb-2">
                  Jūs esate €{Math.max(0, 80 - totalPrice).toFixed(2)} nuo NEMOKAMO pristatymo!
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalPrice / 80) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-brand-orange" />
                    <span className="text-xs text-gray-600">Nemokamas pristatymas nuo €80</span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-bg-alt border border-brand-urgency/40 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-2 text-brand-urgency">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Pasiūlymas baigiasi:</span>
                  <span className="font-bold">
                    {urgencyTimer.hours}:{urgencyTimer.minutes.toString().padStart(2, '0')}:{urgencyTimer.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </>
          )}

          {totalItems === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t.emptyCart}</p>
              <button
                onClick={onClose}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2 rounded-lg text-sm min-h-[48px]"
              >
                {t.continueShopping}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <OptimizedImage src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" loading="lazy" decoding="async" width={64} height={64} sizes="64px" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      {item.selectedColor && <p className="text-xs text-gray-500 font-semibold">Spalva: {item.selectedColor}</p>}
                      {item.selectedSize && <p className="text-xs text-gray-500 font-semibold">{item.sizeLabel || 'Dydis'}: {item.selectedSize}</p>}
                      <span className="text-lg font-bold text-brand-orange">€{item.price}</span>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-300">-</button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-sm hover:bg-gray-300">+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-brand-orange">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {upsellSlot}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{t.orderTotal}:</span>
                    <span className="text-xl font-bold text-brand-orange">€{totalPrice.toFixed(2)}</span>
                  </div>
                  <button onClick={onCheckout} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-3 rounded-lg font-semibold transition min-h-[48px]">
                    {t.checkout} • €{(totalPrice + (totalPrice >= 80 ? 0 : 2.99) + (giftWrapping ? 2.99 : 0)).toFixed(2)}
                  </button>
                </div>

                <style>{`
                  .checkout-pay-chip {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 32px;
                    padding: 4px 11px;
                    border-radius: 8px;
                    background: #ffffff;
                    border: 1px solid rgba(226, 232, 240, 0.95);
                    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 7px 20px rgba(15, 23, 42, 0.06);
                  }
                  .checkout-ssl-banner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                    padding: 10px 14px;
                    border-radius: 14px;
                    background: #ffffff;
                    border: 1px solid rgba(226, 232, 240, 0.95);
                    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(15, 23, 42, 0.07);
                  }
                `}</style>
                <div className="flex justify-center gap-2 pt-4 flex-wrap">
                  <div className="checkout-pay-chip">
                    <img src="/mastercard.svg" width={28} height={20} className="h-5 w-auto" alt="Mastercard" loading="lazy" decoding="async" />
                  </div>
                  <div className="checkout-pay-chip">
                    <span style={{ color: '#1a1f71', fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', lineHeight: 1 }}>VISA</span>
                  </div>
                </div>

                <div className="checkout-ssl-banner">
                  <Lock className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span className="text-xs text-gray-700 font-semibold">256-bit SSL Secure Checkout</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

CartSidebar.displayName = 'CartSidebar';
