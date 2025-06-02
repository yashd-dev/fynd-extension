"use client";
import React, { useState } from "react";
import Details from "./details";
import Colors from "./colors";
import Preview from "./preview";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Manager from "./manager";

export interface ProductData {
  name: string;
  description: string;
  price: number;
  baseImage: string;
  colorVariants: {
    hexCode: string;
    image: string;
    generatedText?: string;
    generatedImageBase64?: string;
  }[];
  selectedChannels: string[];
  selectedProduct?: string;
}

type FlowStep =
  | "channel-select"
  | "product-choice"
  | "upload"
  | "create"
  | "preview";

const INDIAN_CHANNELS = [
  {
    id: "fabindia",
    name: "Fabindia",
    url: "fabindia.com",
    status: "ACTIVE",
    icon: "🧵",
  },
  { id: "biba", name: "Biba", url: "biba.in", status: "ACTIVE", icon: "👗" },
  { id: "w", name: "W", url: "wforwoman.com", status: "ACTIVE", icon: "👚" },
  {
    id: "max",
    name: "Max",
    url: "maxfashion.com",
    status: "ACTIVE",
    icon: "👔",
  },
  {
    id: "pantaloons",
    name: "Pantaloons",
    url: "pantaloons.com",
    status: "ACTIVE",
    icon: "👖",
  },
  {
    id: "westside",
    name: "Westside",
    url: "westside.com",
    status: "ACTIVE",
    icon: "🛍️",
  },
  {
    id: "shoppersstop",
    name: "Shoppers Stop",
    url: "shoppersstop.com",
    status: "ACTIVE",
    icon: "🛒",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    url: "lifestylestores.com",
    status: "ACTIVE",
    icon: "👕",
  },
];

// Dummy data for existing products
const EXISTING_PRODUCTS = {
  fabindia: [
    {
      id: "fab1",
      name: "Cotton Kurta",
      price: 1299,
      description: "Handcrafted cotton kurta with traditional block prints",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
    {
      id: "fab2",
      name: "Block Print Dress",
      price: 2499,
      description: "Floral block print dress with mirror work details",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
    {
      id: "fab3",
      name: "Embroidered Top",
      price: 1799,
      description: "Hand-embroidered top with traditional motifs",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
  ],
  biba: [
    {
      id: "bib1",
      name: "Floral Anarkali",
      price: 2999,
      description: "Floral print anarkali suit with dupatta",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
    {
      id: "bib2",
      name: "Designer Saree",
      price: 4999,
      description: "Handwoven silk saree with zari work",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
    {
      id: "bib3",
      name: "Party Wear Suit",
      price: 3499,
      description: "Embellished party wear suit with sequin work",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
  ],
  w: [
    {
      id: "w1",
      name: "Casual Tunic",
      price: 1599,
      description: "Comfortable cotton tunic with side slits",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
    {
      id: "w2",
      name: "Printed Palazzo",
      price: 1899,
      description: "Floral print palazzo with elastic waist",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
  ],
  max: [
    {
      id: "max1",
      name: "Formal Shirt",
      price: 999,
      description: "Classic fit formal shirt in cotton",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
    {
      id: "max2",
      name: "Slim Fit Jeans",
      price: 1499,
      description: "Stretch denim jeans with slim fit",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
  ],
  pantaloons: [
    {
      id: "pan1",
      name: "Casual Shirt",
      price: 899,
      description: "Regular fit casual shirt in cotton",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
    {
      id: "pan2",
      name: "Chino Pants",
      price: 1299,
      description: "Classic chino pants in khaki",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
  ],
  westside: [
    {
      id: "west1",
      name: "Summer Dress",
      price: 1999,
      description: "Floral print summer dress with smocked top",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
    {
      id: "west2",
      name: "Casual Top",
      price: 799,
      description: "Basic casual top in cotton",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
  ],
  shoppersstop: [
    {
      id: "ss1",
      name: "Designer Kurti",
      price: 2499,
      description: "Embroidered kurti with mirror work",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
    {
      id: "ss2",
      name: "Party Wear Gown",
      price: 5999,
      description: "Sequined party wear gown with tulle",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=200&h=200&fit=crop",
    },
  ],
  lifestyle: [
    {
      id: "life1",
      name: "Casual Shirt",
      price: 1199,
      description: "Regular fit casual shirt in cotton",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&h=200&fit=crop",
    },
    {
      id: "life2",
      name: "Denim Jacket",
      price: 2499,
      description: "Classic denim jacket with button closure",
      image:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop",
    },
  ],
};

const ProductCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("channel-select");
  const [showModal, setShowModal] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    price: 0,
    baseImage: "",
    colorVariants: [],
    selectedChannels: [],
  });

  const handleNext = () => {
    switch (currentStep) {
      case "channel-select":
        if (productData.selectedChannels.length > 0) {
          setCurrentStep("product-choice");
        }
        break;
      case "product-choice":
        break;
      case "upload":
        if (productData.selectedProduct) {
          setCurrentStep("preview");
        }
        break;
      case "create":
        setCurrentStep("preview");
        break;
      case "preview":
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "product-choice":
        setCurrentStep("channel-select");
        break;
      case "upload":
        setCurrentStep("product-choice");
        break;
      case "create":
        setCurrentStep("product-choice");
        break;
      case "preview":
        if (productData.selectedProduct) {
          setCurrentStep("upload");
        } else {
          setCurrentStep("create");
        }
        break;
    }
  };

  const handleSubmit = () => {
    setShowModal(true);
  };

  const handleConfirmPublish = () => {
    console.log("Final product data:", productData);
    setShowModal(false);
    setCurrentStep("channel-select");
    setProductData({
      name: "",
      description: "",
      price: 0,
      baseImage: "",
      colorVariants: [],
      selectedChannels: [],
    });
  };

  const handleColorVariantsChange = (
    variants: { hexCode: string; image: string }[]
  ) => {
    setProductData((prev) => ({
      ...prev,
      colorVariants: variants,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case "channel-select":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {INDIAN_CHANNELS.map((channel, index) => (
              <div
                key={channel.id}
                className={`bg-white rounded-lg border ${productData.selectedChannels.includes(channel.id)
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                  } p-6 hover:shadow-md transition-shadow relative cursor-pointer`}
                onClick={() => {
                  setProductData((prev) => ({
                    ...prev,
                    selectedChannels: [channel.id],
                    selectedProduct: undefined,
                  }));
                }}
              >
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-teal-500 text-white p-2 rounded-full">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4">
                  <div className="text-white text-xl">{channel.icon}</div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {channel.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{channel.url}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    {productData.selectedChannels.includes(channel.id)
                      ? "SELECTED"
                      : channel.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        );
      case "product-choice":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            <div
              onClick={() => setCurrentStep("upload")}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4">
                <div className="text-white text-xl">📤</div>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  Upload Existing Product
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload an existing product with its details and images
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  UPLOAD
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div
              onClick={() => setCurrentStep("create")}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4">
                <div className="text-white text-xl">✨</div>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  Create New Product
                </h3>
                <p className="text-gray-600 text-sm">
                  Create a new product from scratch with color variants
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  CREATE
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        );
      case "upload":
        const selectedChannel = productData.selectedChannels[0];
        const channelProducts =
          EXISTING_PRODUCTS[
          selectedChannel as keyof typeof EXISTING_PRODUCTS
          ] || [];

        if (productData.selectedProduct) {
          const selectedProduct = channelProducts.find(
            (p) => p.id === productData.selectedProduct
          );
          if (selectedProduct) {
            return (
              <div className="my-8">
                <Manager
                  product={{
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    description: selectedProduct.description || "",
                    image: selectedProduct.image,
                  }}
                  onNext={handleNext}
                  onBack={handleBack}
                  onColorVariantsChange={handleColorVariantsChange}
                />
              </div>
            );
          }
        }

        return (
          <div className="my-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">
                Select Existing Product
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a product from{" "}
                  {INDIAN_CHANNELS.find((c) => c.id === selectedChannel)?.name}
                </label>
                <div className="space-y-2">
                  {channelProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${productData.selectedProduct === product.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                        }`}
                      onClick={() => {
                        setProductData((prev) => ({
                          ...prev,
                          selectedProduct: product.id,
                          name: product.name,
                          price: product.price,
                          description: product.description,
                          baseImage: product.image,
                        }));
                      }}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.description}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ₹{product.price}
                        </p>
                      </div>
                      {productData.selectedProduct === product.id && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
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
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "create":
        return (
          <div className="my-8 space-y-6">
            <Details
              data={productData}
              onChange={(data) =>
                setProductData((prev) => ({ ...prev, ...data }))
              }
              onNext={() => setCurrentStep("preview")}
              onBack={handleBack}
            />
            <Colors
              baseImage={productData.baseImage}
              variants={productData.colorVariants}
              onChange={(variants) =>
                setProductData((prev) => ({ ...prev, colorVariants: variants }))
              }
              onNext={() => setCurrentStep("preview")}
              onBack={handleBack}
            />
          </div>
        );
      case "preview":
        return (
          <div className="my-8">
            <Preview
              productData={{
                name: productData.name,
                description: productData.description,
                price: productData.price,
                baseImage: productData.baseImage,
                colorVariants: productData.colorVariants,
              }}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-between">
      <div className="mb-8">
        <nav className="text-sm text-gray-600 mb-4">
          <span>Home</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentStep === "channel-select"
              ? "Select Sales Channel"
              : currentStep === "product-choice"
                ? "Choose Product Option"
                : currentStep === "upload"
                  ? "Upload Product"
                  : currentStep === "create"
                    ? "Create New Product"
                    : "Preview Product"}
          </h1>
          <p className="text-gray-600">
            {currentStep === "channel-select"
              ? "Select the sales channel where you want to publish your product"
              : currentStep === "product-choice"
                ? "Choose how you want to add your product"
                : currentStep === "upload"
                  ? "Select an existing product to upload"
                  : currentStep === "create"
                    ? "Create a new product with color variants"
                    : "Review your product before publishing"}
          </p>
        </div>

        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          disabled={
            (currentStep === "channel-select" &&
              productData.selectedChannels.length === 0) ||
            (currentStep === "upload" && !productData.selectedProduct) ||
            (currentStep === "preview" && !productData.name)
          }
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${(currentStep === "channel-select" &&
              productData.selectedChannels.length > 0) ||
              (currentStep === "upload" && productData.selectedProduct) ||
              (currentStep === "preview" && productData.name)
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          <span>{currentStep === "preview" ? "Publish Product" : "Next"}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirm Product Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  Product Information
                </h4>
                <p className="text-gray-600">Name: {productData.name}</p>
                <p className="text-gray-600">Price: ₹{productData.price}</p>
                <p className="text-gray-600">
                  Description: {productData.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Sales Channel</h4>
                <p className="text-gray-600">
                  {
                    INDIAN_CHANNELS.find(
                      (c) => c.id === productData.selectedChannels[0]
                    )?.name
                  }
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Color Variants</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {productData.colorVariants.map((variant, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: variant.hexCode }}
                      />
                      <span className="text-gray-600">{variant.hexCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCreationFlow;
