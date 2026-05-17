// Summer shop – one product listing with many variants (blaster, mini, 2-pack, 4-pack, refill).
import type { Product } from "../store/productStore";

export const initialProducts: Product[] = [
  {
    id: 1001,
    name: "Vandens šautuvai – Vasaros Kampelis",
    price: 35.99,
    originalPrice: 46.99,
    image: "/blue1.webp",
    images: ["/blue1.webp", "/blue2.webp", "/blue3.webp", "/pink1.webp", "/pink2.webp", "/pink3.webp"],
    imagesBySize: [
      ["/blue1.webp", "/blue2.webp", "/blue3.webp"],
      ["/pink1.webp", "/pink2.webp", "/pink3.webp"],
      ["/bluepistol1.webp", "/bluepistol2.webp", "/bluepistol3.webp"],
      ["/pinkpistol1.webp", "/pinkpistol2.webp", "/pinkpistol3.webp"],
    ],
    imagesByColor: [
      ["/blue1.webp", "/blue2.webp", "/blue3.webp"],
      ["/pink1.webp", "/pink2.webp", "/pink3.webp"],
    ],
    colors: [
      { name: "Mėlyna", value: "blue" },
      { name: "Rožinė", value: "pink" },
    ],
    rating: 4.9,
    reviews: 127,
    discount: "Iki -35%",
    description:
      "Galingas vandens šautuvas, su kuriuo valdysi visą kiemą - niekas nespės pabėgti. Čia tavo teritorija. 😎🔥",
    features: [
      "Didelė vandens talpa - mažiau papildymų, daugiau žaidimo\u00A0💧",
      "Ergonomiška forma - patogu laikyti ir lengva valdyti\u00A0✋",
      "Aukšta surinkimo kokybė - patikimas ir tvirtas dizainas\u00A0🛠️",
      "Saugus dizainas - be aštrių kraštų\u00A0🛡️",
      "Ilgaamžė kokybė - sukurtas tarnauti ne vieną vasarą\u00A0⭐",
    ],
    sizes: [{ name: "Mėlyna", value: "blue" }, { name: "Rožinė", value: "pink" }],
    sizeGroups: [
      {
        label: "Šautuvo Tipas",
        sizes: [
          { name: "Automatas", value: "automatas" },
          { name: "Pistoletas", value: "pistoletas" },
        ],
      },
      {
        label: "Spalva",
        sizes: [
          { name: "Mėlyna", value: "blue" },
          { name: "Rožinė", value: "pink" },
        ],
      },
    ],
    sizeLabel: "Spalva",
    pricesBySize: [35.99, 35.99, 27.99, 27.99],
    originalPricesBySize: [46.99, 46.99, 35.99, 35.99],
    category: "Vandens šautuvai",
    tags: ["vandens blasteris", "vasara", "žaidimai lauke", "šeima", "rinkiniai", "refill"],
    stock: 9999,
    isNew: true,
    isPopular: true,
    createdAt: new Date(),
  },
];
