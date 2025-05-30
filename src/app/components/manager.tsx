"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface ColorVariant {
  hexCode: string;
  image: string;
  isApproved: boolean;
}

export interface ManagerProps {
  product: Product;
  onNext: () => void;
  onBack: () => void;
  onColorVariantsChange: (variants: ColorVariant[]) => void;
}

const Manager: React.FC<ManagerProps> = ({
  product,
  onNext,
  onBack,
  onColorVariantsChange,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<ColorVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [generatedVariants, setGeneratedVariants] = useState<ColorVariant[]>(
    []
  );

  // Update parent component when selected variants change
  useEffect(() => {
    onColorVariantsChange(selectedVariants);
  }, [selectedVariants, onColorVariantsChange]);

  const handleAddColor = async () => {
    setIsLoading(true);
    try {
      // Here you would make the API call to your backend
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate backend response with the generated image
      const newVariant: ColorVariant = {
        hexCode: newColor,
        image: product.image, // In reality, this would be the URL returned from your backend
        isApproved: false,
      };

      setGeneratedVariants((prev) => [...prev, newVariant]);
      setNewColor("#000000"); // Reset color picker
    } catch (error) {
      console.error("Error generating color variant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVariant = (variant: ColorVariant) => {
    const approvedVariant = { ...variant, isApproved: true };
    setSelectedVariants((prev) => [...prev, approvedVariant]);
    setGeneratedVariants((prev) =>
      prev.filter((v) => v.hexCode !== variant.hexCode)
    );
  };

  const handleRejectVariant = (variant: ColorVariant) => {
    setGeneratedVariants((prev) =>
      prev.filter((v) => v.hexCode !== variant.hexCode)
    );
  };

  const handleRemoveVariant = (hexCode: string) => {
    setSelectedVariants((prev) => prev.filter((v) => v.hexCode !== hexCode));
  };

  const handleRetry = () => {
    setGeneratedVariants([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Product Details */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              ₹{product.price}
            </p>
          </div>
        </div>

        {/* Color Picker Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Add Color Variants</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded-md cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleAddColor}
              disabled={isLoading}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "Generating..." : "Add Color"}
            </button>
          </div>
        </div>

        {/* Generated Variants */}
        {generatedVariants.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Generated Variants</h4>
              <button
                onClick={handleRetry}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedVariants.map((variant) => (
                <div
                  key={variant.hexCode}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: variant.hexCode }}
                      />
                      <span className="font-medium text-gray-900">
                        {variant.hexCode}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveVariant(variant)}
                        className="p-1 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRejectVariant(variant)}
                        className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="aspect-square w-full">
                    {variant.image ? (
                      <img
                        src={variant.image}
                        alt={`${product.name} in ${variant.hexCode}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Variants */}
        {selectedVariants.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Selected Color Variants
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedVariants.map((variant) => (
                <div
                  key={variant.hexCode}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: variant.hexCode }}
                      />
                      <span className="font-medium text-gray-900">
                        {variant.hexCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveVariant(variant.hexCode)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="aspect-square w-full">
                    {variant.image ? (
                      <img
                        src={variant.image}
                        alt={`${product.name} in ${variant.hexCode}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-6">
            <LoadingAnimation message="Generating product image..." />
          </div>
        )}
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
          disabled={selectedVariants.length === 0 || isLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            selectedVariants.length > 0 && !isLoading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Manager;
