import React, { useState, useEffect } from 'react';
import { X, Star, Check, X as XIcon } from 'lucide-react';
import { Product } from '../store/productStore';
import OptimizedImage from './OptimizedImage';

interface ProductComparisonProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
}) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen || products.length === 0) return null;

  const features = [
    'LED apšvietimas',
    'Vandeniui atsparus',
    'Lengvas valymas',
    'Saugus naudojimas',
    'Ilgai išlieka',
    'Ekologiškas',
    'Rankų darbo',
    'Premium kokybė'
  ];

  const getFeatureValue = (product: Product, feature: string) => {
    return product.features.includes(feature);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-surface rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${entered ? 'popup-scale-end' : 'popup-scale-start'}`}
      >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Produktų palyginimas ({products.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-900 min-w-[200px]">
                    Charakteristikos
                  </th>
                  {products.map(product => (
                    <th key={product.id} className="text-center p-4 min-w-[250px]">
                      <div className="relative">
                        <button
                          onClick={() => onRemoveProduct(product.id)}
                          className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <XIcon className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        <div className="mb-4">
                          <OptimizedImage
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                            loading="lazy"
                            decoding="async"
                            width={96}
                            height={96}
                            sizes="96px"
                          />
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-center space-x-1 mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {product.rating} ({product.reviews})
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-brand-orange">
                              €{product.price}
                            </span>
                            <span className="text-sm text-gray-400 line-through ml-1">
                              €{product.originalPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Basic Info */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Aprašymas</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-sm text-gray-600 text-center">
                      {product.description}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Kaina</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-red-600">€{product.price}</span>
                      <div className="text-sm text-gray-400 line-through">
                        €{product.originalPrice}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Įvertinimas</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Likutis</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} vnt.` : 'Nėra'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                {features.map(feature => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900">{feature}</td>
                    {products.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {getFeatureValue(product, feature) ? (
                          <Check className="w-5 h-5 text-brand-green mx-auto" />
                        ) : (
                          <XIcon className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Colors */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Spalvos</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.colors?.map((color, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {color.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Sizes */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-900">Dydžiai</td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {size.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Uždaryti
              </button>
              {products.length >= 2 && (
                <button className="px-6 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg transition min-h-[44px]">
                  Pridėti visus į krepšelį
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};


