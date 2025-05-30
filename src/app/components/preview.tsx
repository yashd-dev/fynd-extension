"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPreviewProps {
  productData: {
    name: string;
    description: string;
    price: number;
    baseImage: string;
    colorVariants: {
      hexCode: string;
      image: string;
    }[];
  };
  onNext: () => void;
  onBack: () => void;
}

const Preview: React.FC<ProductPreviewProps> = ({
  productData,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-between">
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Product Preview</h2>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square w-full mb-4">
                <img
                  src={productData.baseImage}
                  alt={productData.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {productData.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {productData.description}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    ₹{productData.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Color Variants */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Color Variants</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {productData.colorVariants.map((variant) => (
                  <div
                    key={variant.hexCode}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: variant.hexCode }}
                      />
                      <span className="font-medium text-gray-900">
                        {variant.hexCode}
                      </span>
                    </div>
                    <div className="aspect-square w-full">
                      <img
                        src={variant.image}
                        alt={`${productData.name} in ${variant.hexCode}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <span>Publish Product</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Preview;
