"use client";
import React, { useState, useCallback } from "react";
import { Upload as UploadIcon, X, Plus } from "lucide-react";
import Image from "next/image";
import { ProductData } from "./ProductCreationFlow";

export interface DetailsProps {
  data: ProductData;
  onChange: (data: Partial<ProductData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Details: React.FC<DetailsProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const handleAddColor = () => {
    if (!selectedColors.includes(newColor)) {
      setSelectedColors([...selectedColors, newColor]);
      setNewColor("#000000");
    }
  };

  const handleRemoveColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color));
  };

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
          onChange({ baseImage: result });
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          onChange({ baseImage: result });
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    onChange({ baseImage: "" });
  }, [onChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColors.length > 0) {
      onChange({
        ...data,
        colorVariants: selectedColors.map((color) => ({
          hexCode: color,
          image: data.baseImage, // This will be replaced with generated images
        })),
      });
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
      <p className="text-gray-600 mb-6">
        Enter product details and select colors for variants.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            {!data.baseImage ? (
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
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-64">
                  <Image
                    src={data.baseImage}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (₹)
              </label>
              <input
                type="number"
                id="price"
                value={data.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Colors for Variants
            </label>
            <div className="flex items-center space-x-4 mb-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span>Add Color</span>
              </button>
            </div>

            {/* Selected Colors */}
            {selectedColors.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedColors.map((color) => (
                  <div
                    key={color}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-900">{color}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!data.baseImage || selectedColors.length === 0}
            className={`px-4 py-2 rounded-lg ${
              data.baseImage && selectedColors.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Generate Variants
          </button>
        </div>
      </form>
    </div>
  );
};

export default Details;
