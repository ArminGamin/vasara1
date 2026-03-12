import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal: any;
  }
}

let paypalScriptAppended = false;

type Customer = {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

type Item = { name: string; quantity: number; price: number };

export default function PayPalButton({
  amountCents,
  total,
  customer,
  items,
  orderNumber
}: {
  amountCents?: number;
  total?: number | string;
  customer?: Customer;
  items?: Item[];
  orderNumber?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const amountRef = useRef<string>('0.00');
  const orderRef = useRef<string | undefined>(orderNumber);
  const renderingRef = useRef(false);

  // Keep the latest adjusted total (PayPal fee uplift) without re-rendering PayPal
  useEffect(() => {
    // Base total in EUR: prefer explicit 'total', otherwise derive from amountCents
    const baseTotal = (() => {
      if (total !== undefined && total !== null) {
        const n = parseFloat(String(total));
        return Number.isFinite(n) ? n : 0;
      }
      if (typeof amountCents === 'number') {
        return Math.round(amountCents) / 100;
      }
      return 0;
    })();
    // Uplift so the store receives approximately the base total after PayPal fees (2.9% + €0.35)
    const adjusted = (baseTotal + 0.35) / (1 - 0.029);
    amountRef.current = adjusted.toFixed(2);
  }, [amountCents, total]);

  // Render PayPal buttons ONCE to avoid flicker; use refs for dynamic values
  useEffect(() => {
    const renderButtons = () => {
      const container = containerRef.current;
      if (!container || !window.paypal || renderedRef.current || renderingRef.current) return;
      renderingRef.current = true;
      window.paypal
        .Buttons({
          fundingSource: window.paypal.FUNDING.PAYPAL,
          style: {
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 45,
          },
          createOrder: function (_data: any, actions: any) {
            return actions.order.create({
              application_context: {
                shipping_preference: "NO_SHIPPING",
                brand_name: "Vasaros Kampelis"
              },
              purchase_units: [
                {
                  description: orderRef.current ? `Užsakymas ${orderRef.current}` : "Užsakymas",
                  amount: { value: amountRef.current, currency_code: "EUR" },
                },
              ],
            });
          },
          onApprove: function (_data: any, actions: any) {
            return actions.order.capture().then(function (details: any) {
              alert(
                "Apmokėjimas sėkmingas! Ačiū, " +
                  details.payer.name.given_name
              );
              // Client-side notify (fallback) to Discord
              try {
                const base = window.location.origin;
                fetch(`${base}/api/notify-discord`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    provider: "paypal",
                    orderNumber: orderRef.current,
                    total: amountRef.current,
                    customer: customer || {},
                    items: (items || []).map(it => ({
                      name: it.name,
                      quantity: it.quantity,
                      price: it.price
                    }))
                  })
                }).catch(() => {});
              } catch {}
            });
          },
          onError: function (err: any) {
            console.error("PayPal error:", err);
          },
        })
        .render(container)
        .then(() => { renderedRef.current = true; renderingRef.current = false; })
        .catch(() => { renderingRef.current = false; });
    };

    if (window.paypal) {
      // render after microtask so React commits the node
      setTimeout(renderButtons, 0);
    } else {
      if (!paypalScriptAppended) {
        const existing = document.getElementById("paypal-sdk");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "paypal-sdk";
          const clientId = (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || "ATGx56eqxqaz4iE4LhwoW_M1t-KszuyGy_dKPIeuT7yzsYbpeQL5xXNXlI7IgNit0KllFbQV6QgJGHnb";
          script.src =
            `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&components=buttons&intent=capture&disable-funding=card,credit`;
          script.async = true;
          script.onload = renderButtons;
          document.body.appendChild(script);
        }
        paypalScriptAppended = true;
      } else {
        // Script was appended but not yet ready; wait briefly then try
        setTimeout(renderButtons, 300);
      }
    }

    return () => {
      // Do not clear the container here to avoid PayPal render race.
      renderedRef.current = false;
    };
  }, []); 

  return (
    <div className="mt-4">
      <div ref={containerRef} style={{ width: '100%' }}></div>
    </div>
  );
}


