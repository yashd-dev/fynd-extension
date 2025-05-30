"use client";
import React, { useState, useCallback } from "react";
import { Upload as UploadIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageUploadProps {
  onImageUpload: (image: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ImageUpload: React.FC<ProductImageUploadProps> = ({
  onImageUpload,
  onNext,
  onBack,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          onImageUpload(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          onImageUpload(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Product Image</h2>
      <p className="text-gray-600 mb-6">
        Upload a high-quality image of your product.
      </p>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your image here, or{" "}
          <label className="text-blue-600 cursor-pointer hover:text-blue-700">
            browse
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">Supports JPG, PNG up to 5MB</p>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
