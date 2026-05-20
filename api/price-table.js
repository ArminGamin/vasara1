/**
 * Server-side price table. NEVER trust client-provided amounts.
 * Maps productId + variant (selectedSize, selectedColor) to price in EUR.
 * Client sends only: productId, selectedSize, selectedColor, quantity.
 * Amount is ALWAYS computed server-side from this table.
 */
/** Keep in sync with src/data/mysteryGift.ts */
const MYSTERY_GIFT_PRODUCT_ID = 9001;
const MYSTERY_GIFT_PRICE_EUR = 8.99;

const PRICE_TABLE = {
  // productId 1001: Vandens šautuvai – Vasaros Kampelis
  // sizeGroups[0]=Šautuvo Tipas (Automatas, Pistoletas), sizeGroups[1]=Spalva (Mėlyna, Rožinė)
  // combinedIndex = typeIdx*2 + colorIdx -> pricesBySize[index]
  1001: {
    pricesByVariant: [35.99, 35.99, 27.99, 27.99], // [Automatas+Mėlyna, Automatas+Rožinė, Pistoletas+Mėlyna, Pistoletas+Rožinė]
    typeValues: ['Automatas', 'Pistoletas'],
    colorValues: ['Mėlyna', 'Rožinė'],
  },
  [MYSTERY_GIFT_PRODUCT_ID]: {
    fixedPrice: MYSTERY_GIFT_PRICE_EUR,
  },
};

const SHIPPING_EUR = 2.99;
const FREE_SHIPPING_THRESHOLD_EUR = 80;
const GIFT_WRAPPING_EUR = 2.99;

function getVariantIndex(productId, selectedSize, selectedColor) {
  const p = PRICE_TABLE[productId];
  if (!p) return -1;
  const typeIdx = p.typeValues.indexOf(selectedSize);
  const colorIdx = p.colorValues.indexOf(selectedColor);
  if (typeIdx < 0 || colorIdx < 0) return -1;
  return typeIdx * 2 + colorIdx;
}

function getPrice(productId, selectedSize, selectedColor) {
  const p = PRICE_TABLE[productId];
  if (!p) return null;
  if (typeof p.fixedPrice === 'number') return p.fixedPrice;
  const idx = getVariantIndex(productId, selectedSize, selectedColor);
  if (idx < 0) return null;
  return p.pricesByVariant[idx];
}

/**
 * Compute order total in cents from trusted item list.
 * @param {Array<{productId: number, selectedSize: string, selectedColor: string, quantity: number}>} items
 * @param {boolean} giftWrapping
 * @returns {{ amountCents: number, subtotalCents: number, shippingCents: number, giftWrappingCents: number, itemsValid: boolean }}
 */
function computeOrderTotal(items, giftWrapping = false) {
  let subtotalCents = 0;
  let itemsValid = true;

  for (const it of items || []) {
    const productId = Number(it.productId);
    const selectedSize = String(it.selectedSize || '').trim();
    const selectedColor = String(it.selectedColor || '').trim();
    const quantity = Math.max(0, Math.min(999, Math.floor(Number(it.quantity) || 1)));

    const price = getPrice(productId, selectedSize, selectedColor);
    if (price == null || quantity <= 0) {
      itemsValid = false;
      break;
    }
    subtotalCents += Math.round(price * 100) * quantity;
  }

  const subtotalEur = subtotalCents / 100;
  const hasMysteryGift = (items || []).some(
    (it) => Number(it.productId) === MYSTERY_GIFT_PRODUCT_ID
  );
  const shippingCents =
    subtotalEur >= FREE_SHIPPING_THRESHOLD_EUR || hasMysteryGift
      ? 0
      : Math.round(SHIPPING_EUR * 100);
  const giftWrappingCents = giftWrapping ? Math.round(GIFT_WRAPPING_EUR * 100) : 0;
  const amountCents = subtotalCents + shippingCents + giftWrappingCents;

  return {
    amountCents,
    subtotalCents,
    shippingCents,
    giftWrappingCents,
    itemsValid: itemsValid && (items?.length > 0),
  };
}

export { PRICE_TABLE, getPrice, computeOrderTotal };
