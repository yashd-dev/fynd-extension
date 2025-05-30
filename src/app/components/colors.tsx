"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import Image from "next/image";

interface ColorsProps {
  baseImage: string;
  variants: { hexCode: string; image: string }[];
  onChange: (variants: { hexCode: string; image: string }[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const Colors: React.FC<ColorsProps> = ({
  baseImage,
  variants,
  onChange,
  onNext,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVariants, setGeneratedVariants] = useState<
    { hexCode: string; image: string }[]
  >([]);
  const [approvedVariants, setApprovedVariants] = useState<
    { hexCode: string; image: string }[]
  >([]);

  const generateVariants = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call to generate variants
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate variants based on selected colors
    const newVariants = variants.map((variant) => ({
      hexCode: variant.hexCode,
      image: baseImage, // In real implementation, this would be the AI-generated image
    }));

    setGeneratedVariants(newVariants);
    setIsLoading(false);
  }, [variants, baseImage]);

  useEffect(() => {
    if (variants.length > 0) {
      generateVariants();
    }
  }, [variants, generateVariants]);

  const handleApproveVariant = (variant: {
    hexCode: string;
    image: string;
  }) => {
    setApprovedVariants((prev) => [...prev, variant]);
    setGeneratedVariants((prev) =>
      prev.filter((v) => v.hexCode !== variant.hexCode)
    );
  };

  const handleRejectVariant = (variant: { hexCode: string; image: string }) => {
    setGeneratedVariants((prev) =>
      prev.filter((v) => v.hexCode !== variant.hexCode)
    );
  };

  const handleRetry = () => {
    generateVariants();
  };

  const handleNext = () => {
    onChange(approvedVariants);
    onNext();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Processing</h3>
          <p className="mt-2 text-gray-600">Generating color variants...</p>
          <div className="w-full max-w-md mt-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Color Variants</h2>
      <p className="text-gray-600 mb-6">
        Review and approve the generated color variants for your product.
      </p>

      {/* Base Image Preview */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Base Image</h3>
        <div className="relative w-32 h-32">
          <Image
            src={baseImage}
            alt="Base product"
            fill
            className="object-cover rounded-lg border border-gray-200"
          />
        </div>
      </div>

      {/* Generated Variants */}
      {generatedVariants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Generated Variants
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectVariant(variant)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative w-full h-48">
                  <Image
                    src={variant.image}
                    alt={`Variant ${variant.hexCode}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Variants */}
      {approvedVariants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Approved Variants
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedVariants.map((variant) => (
              <div
                key={variant.hexCode}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-200"
                    style={{ backgroundColor: variant.hexCode }}
                  />
                  <span className="font-medium text-gray-900">
                    {variant.hexCode}
                  </span>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="relative w-full h-48">
                  <Image
                    src={variant.image}
                    alt={`Variant ${variant.hexCode}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-4">
          {generatedVariants.length > 0 && (
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Generation</span>
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={approvedVariants.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              approvedVariants.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Colors;
