import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SITE_NAME = 'Vasaros Kampelis';
const DEFAULT_DESC = 'Galingi vandens šautuvai ir blasteriai iki 10m šūvio. Mėlyna ir rožinė spalva. Nemokamas pristatymas nuo 80€. Pristatymas į visą Lietuvą per 8–12 d.';

export { SITE_NAME, DEFAULT_DESC };

export default function PageWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }
    return () => {
      document.title = `${SITE_NAME} | Vandens šautuvai ir vasaros žaidimai Lietuvoje`;
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', DEFAULT_DESC);
    };
  }, [title, description]);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-brand-blue-deep text-white py-3 text-center text-lg font-bold">
        {title}
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-lg">{children}</div>
      <div className="text-center mb-10">
        <button
          onClick={() => navigate("/")}
          className="bg-brand-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-orange-hover transition min-h-[48px]"
        >
          Grįžti atgal
        </button>
      </div>
    </div>
  );
}
