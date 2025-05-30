"use client";
import React from "react";

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation = ({
  message = "Generating color variants...",
}: LoadingAnimationProps) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Color Swatch Animation */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 animate-pulse" />
            <div className="absolute inset-2 rounded-lg bg-white animate-ping" />
            <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 animate-spin" />
          </div>

          {/* Loading Text */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing
          </h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
          </div>

          {/* Loading Steps */}
          <div className="mt-6 space-y-2 w-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-gray-600">
                Analyzing product image
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
              <span className="text-sm text-gray-600">
                Generating color variants
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
              <span className="text-sm text-gray-600">Optimizing images</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
