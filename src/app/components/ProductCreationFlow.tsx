"use client"
import { useState, useEffect } from "react"
import Details from "./details"
import Colors from "./colors"
import Preview from "./preview"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Manager from "./manager"

// Updated interface to match API response
export interface ApiProduct {
  item_code: string
  name: string
  uid: number
  slug: string
  price: {
    marked: {
      min: number
      max: number
    }
    effective: {
      min: number
      max: number
    }
  }
  images: Array<{
    url: string
    secure_url: string
    aspect_ratio?: string
    aspect_ratio_f?: number
  }>
  brand: {
    name: string
    uid: number
    logo?: {
      url: string
      secure_url: string
    }
  }
  sizes: Array<{
    size: string
    sellable_quantity: number
    sellable: boolean
    price: {
      marked: {
        min: number
        max: number
      }
      effective: {
        min: number
        max: number
      }
    }
    seller_identifier: string
  }>
  category_name: string
  status: string
  currency: string
  country_of_origin: string
}

export interface ProductData {
  name: string
  description: string
  price: number
  baseImage: string
  colorVariants: {
    hexCode: string
    image: string
    generatedText?: string
    generatedImageBase64?: string
  }[]
  selectedProduct?: string
  selectedProductUid?: number // Added to store the UID
}

type FlowStep = "product-choice" | "upload" | "create" | "preview"

const ProductCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("product-choice")
  const [showModal, setShowModal] = useState(false)
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    price: 0,
    baseImage: "",
    colorVariants: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: localStorage.getItem("fynd_access_token") || "",
            companyId: localStorage.getItem("fynd_company_id") || "",
          }),
        })
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data.items || [])
      } catch (err: any) {
        console.error("Error fetching products:", err)
        setError(err.message || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleNext = () => {
    switch (currentStep) {
      case "product-choice":
        break
      case "upload":
        if (productData.selectedProduct) {
          setCurrentStep("preview")
        }
        break
      case "create":
        setCurrentStep("preview")
        break
      case "preview":
        handleSubmit()
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case "upload":
        setCurrentStep("product-choice")
        break
      case "create":
        setCurrentStep("product-choice")
        break
      case "preview":
        if (productData.selectedProduct) {
          setCurrentStep("upload")
        } else {
          setCurrentStep("create")
        }
        break
    }
  }

  const handleSubmit = () => {
    setShowModal(true)
  }

  // Utility function to download base64 image
  const downloadBase64Image = (base64Data: string, filename: string) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data.split(',')[1] || base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  // Utility function to download image from URL
  const downloadImageFromUrl = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image from URL:', error);
    }
  }

  const handleConfirmPublish = async () => {
    try {
      setIsSubmitting(true)

      // Get product name for filename prefix
      const productName = productData.name.replace(/[^a-zA-Z0-9]/g, '_') || 'product';

      // Download base image if available
      if (productData.baseImage) {
        if (productData.baseImage.startsWith('data:')) {
          // Base64 image
          downloadBase64Image(productData.baseImage, `${productName}_base_image.png`);
        } else {
          // URL image
          await downloadImageFromUrl(productData.baseImage, `${productName}_base_image.png`);
        }
      }

      // Download all color variant images
      const downloadPromises = productData.colorVariants.map(async (variant, index) => {
        const colorCode = variant.hexCode.replace('#', '');

        // Download generated image if available
        if (variant.generatedImageBase64) {
          downloadBase64Image(
            variant.generatedImageBase64,
            `${productName}_variant_${colorCode}_${index + 1}.png`
          );
        }

        // Also download original variant image if it's different from generated
        if (variant.image && variant.image !== variant.generatedImageBase64) {
          if (variant.image.startsWith('data:')) {
            downloadBase64Image(
              variant.image,
              `${productName}_original_variant_${colorCode}_${index + 1}.png`
            );
          } else {
            await downloadImageFromUrl(
              variant.image,
              `${productName}_original_variant_${colorCode}_${index + 1}.png`
            );
          }
        }
      });

      // Wait for all downloads to complete
      await Promise.all(downloadPromises);

      // Create and download a summary JSON file with product details
      const productSummary = {
        productName: productData.name,
        description: productData.description,
        price: productData.price,
        selectedProduct: productData.selectedProduct,
        selectedProductUid: productData.selectedProductUid,
        colorVariants: productData.colorVariants.map(variant => ({
          hexCode: variant.hexCode,
          generatedText: variant.generatedText,
          hasGeneratedImage: !!variant.generatedImageBase64,
          hasOriginalImage: !!variant.image
        })),
        downloadedAt: new Date().toISOString()
      };

      const summaryBlob = new Blob([JSON.stringify(productSummary, null, 2)], {
        type: 'application/json'
      });
      const summaryUrl = URL.createObjectURL(summaryBlob);
      const summaryLink = document.createElement('a');
      summaryLink.href = summaryUrl;
      summaryLink.download = `${productName}_summary.json`;
      document.body.appendChild(summaryLink);
      summaryLink.click();
      document.body.removeChild(summaryLink);
      URL.revokeObjectURL(summaryUrl);

      alert(`All images and product summary have been downloaded successfully!\n\nFiles downloaded:\n- Base image\n- ${productData.colorVariants.length} color variant images\n- Product summary JSON`);

      // Reset the form and close modal
      setShowModal(false)
      setCurrentStep("product-choice")
      setProductData({
        name: "",
        description: "",
        price: 0,
        baseImage: "",
        colorVariants: [],
      })
    } catch (error: any) {
      console.error("Failed to download images:", error)
      alert(`Error: ${error.message || "Failed to download images"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleColorVariantsChange = (variants: { hexCode: string; image: string }[]) => {
    setProductData((prev) => ({
      ...prev,
      colorVariants: variants,
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
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
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Upload Existing Product</h3>
                <p className="text-gray-600 text-sm">Upload an existing product with its details and images</p>
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
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Create New Product</h3>
                <p className="text-gray-600 text-sm">Create a new product from scratch with color variants</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  CREATE
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        )
      case "upload":
        if (productData.selectedProduct) {
          const selectedProduct = products.find((p) => p.item_code === productData.selectedProduct)
          if (selectedProduct) {
            return (
              <div className="my-8">
                <Manager
                  product={{
                    id: selectedProduct.item_code,
                    name: selectedProduct.name,
                    price: selectedProduct.price.effective.min,
                    description: `${selectedProduct.brand.name} - ${selectedProduct.category_name}`,
                    image: selectedProduct.images[0]?.secure_url || selectedProduct.images[0]?.url || "",
                  }}
                  onNext={handleNext}
                  onBack={handleBack}
                  onColorVariantsChange={handleColorVariantsChange}
                />
              </div>
            )
          }
        }

        return (
          <div className="my-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Select Existing Product</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a product from the available inventory
                </label>

                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
                )}

                {!isLoading && !error && products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No products found. Please check your connection or try again later.
                  </div>
                )}

                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.item_code}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${productData.selectedProduct === product.item_code
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                        }`}
                      onClick={() => {
                        setProductData((prev) => ({
                          ...prev,
                          selectedProduct: product.item_code,
                          selectedProductUid: product.uid, // Store the UID
                          name: product.name,
                          price: product.price.effective.min,
                          description: `${product.brand.name} - ${product.category_name}`,
                          baseImage: product.images[0]?.secure_url || product.images[0]?.url || "",
                        }))
                      }}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].secure_url || product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {product.brand.name} - {product.category_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-medium text-gray-900">
                            {product.currency} {product.price.effective.min}
                          </p>
                          {product.price.marked.min > product.price.effective.min && (
                            <p className="text-sm text-gray-500 line-through">
                              {product.currency} {product.price.marked.min}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Available sizes: {product.sizes.map((s) => s.size).join(", ")}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          UID: {product.uid} • Item Code: {product.item_code}
                        </p>
                      </div>
                      {productData.selectedProduct === product.item_code && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
        )
      case "create":
        return (
          <div className="my-8 space-y-6">
            <Details
              data={productData}
              onChange={(data) => setProductData((prev) => ({ ...prev, ...data }))}
              onNext={() => setCurrentStep("preview")}
              onBack={handleBack}
            />
            <Colors
              baseImage={productData.baseImage}
              variants={productData.colorVariants}
              onChange={(variants) => setProductData((prev) => ({ ...prev, colorVariants: variants }))}
              onNext={() => setCurrentStep("preview")}
              onBack={handleBack}
            />
          </div>
        )
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
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-between">
      <div className="mb-8">
        <nav className="text-sm text-gray-600 mb-4">
          <span>Home</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentStep === "product-choice"
              ? "Choose Product Option"
              : currentStep === "upload"
                ? "Upload Product"
                : currentStep === "create"
                  ? "Create New Product"
                  : "Preview Product"}
          </h1>
          <p className="text-gray-600">
            {currentStep === "product-choice"
              ? "Choose how you want to add your product"
              : currentStep === "upload"
                ? "Select an existing product to upload"
                : currentStep === "create"
                  ? "Create a new product with color variants"
                  : "Review your product before downloading images"}
          </p>
        </div>

        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
        <button
          onClick={handleBack}
          disabled={currentStep === "product-choice"}
          className={`flex items-center space-x-2 ${currentStep === "product-choice" ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          disabled={
            (currentStep === "upload" && !productData.selectedProduct) ||
            (currentStep === "preview" && !productData.name)
          }
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${(currentStep === "upload" && productData.selectedProduct) ||
            (currentStep === "preview" && productData.name) ||
            currentStep === "product-choice" ||
            currentStep === "create"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          <span>{currentStep === "preview" ? "Download Images" : "Next"}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Download Product Images</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Product Information</h4>
                <p className="text-gray-600">Name: {productData.name}</p>
                <p className="text-gray-600">Price: ₹{productData.price}</p>
                <p className="text-gray-600">Description: {productData.description}</p>
              </div>

              {productData.selectedProduct && (
                <div>
                  <h4 className="font-medium text-gray-900">Selected Product</h4>
                  <p className="text-gray-600">Item Code: {productData.selectedProduct}</p>
                  <p className="text-gray-600">UID: {productData.selectedProductUid}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">Images to Download</h4>
                <div className="mt-2 space-y-2">
                  {productData.baseImage && (
                    <p className="text-sm text-gray-600">✓ Base product image</p>
                  )}
                  {productData.colorVariants.map((variant, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: variant.hexCode }}
                      />
                      <span className="text-sm text-gray-600">
                        Color variant: {variant.hexCode}
                        {variant.generatedImageBase64 && ' (Generated)'}
                      </span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600">✓ Product summary JSON file</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All images and a summary file will be downloaded to your device.
                  The browser may ask for permission to download multiple files.
                </p>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  "Start Download"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductCreationFlow