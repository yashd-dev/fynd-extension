import { type NextRequest, NextResponse } from "next/server"

interface GeneratedVariant {
    hexCode: string
    image: string
    generatedText?: string
    generatedImageBase64?: string
}

interface UpdateProductRequest {
    uid: number
    generatedVariants: GeneratedVariant[]
    accessToken: string
    company_id: number
}

export async function POST(req: NextRequest) {
    try {
        const { uid, generatedVariants, accessToken, company_id }: UpdateProductRequest = await req.json()

        if (!uid || !generatedVariants?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (!accessToken || !company_id) {
            return NextResponse.json({ error: "Missing authentication details" }, { status: 401 })
        }

        // Get existing product details to copy required fields
        const existingProduct = await getExistingProduct(uid, accessToken, company_id)

        if (!existingProduct || !existingProduct.data) {
            return NextResponse.json({ error: "Product not found or invalid response format" }, { status: 404 })
        }

        console.log("Existing product details:", existingProduct.data.uid)
        console.log("Generated variants:", existingProduct.data.item_id)
        console.log("Generated variants:", existingProduct)

        // Update the product with variants using PUT method
        const updateResult = await updateProductWithVariants(
            uid,
            generatedVariants,
            existingProduct.data,
            accessToken,
            company_id,
        )

        return NextResponse.json({
            success: true,
            uid,
            updateResult,
        })
    } catch (error: any) {
        console.error("Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

async function getExistingProduct(uid: number, accessToken: string, company_id: number) {
    console.log(`Fetching product with UID ${uid} for company ${company_id}`)

    const response = await fetch(
        `https://api.fynd.com/service/platform/catalog/v2.0/company/${company_id}/products/${uid}/`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        },
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch product: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Fetched product data successfully", data)
    return { data }
}

async function updateProductWithVariants(
    uid: number,
    generatedVariants: GeneratedVariant[],
    existingProduct: any,
    accessToken: string,
    company_id: number,
) {
    try {
        // Create variants object based on generated variants
        const variants: Record<string, any> = {
            color: {},
        }

        // Add each color variant
        generatedVariants.forEach((variant) => {
            const cleanHex = variant.hexCode.replace("#", "")
            variants.color[cleanHex] = {
                name: variant.hexCode,
                hex_code: variant.hexCode,
                image: variant.image,
            }
        })

        // Create variant_media mapping
        const variant_media: Record<string, any> = {}

        generatedVariants.forEach((variant) => {
            const cleanHex = variant.hexCode.replace("#", "")
            variant_media[`color:${cleanHex}`] = [
                {
                    type: "image",
                    url: variant.image,
                },
            ]
        })

        // Prepare the update payload based on the curl example
        const updatePayload = {
            // Keep existing fields
            ...existingProduct.data,

            // Update with variant information
            variants,
            variant_media,

            // Add action field required by API
            action: "update",

            // Update attributes to include color information
            attributes: {
                ...(existingProduct.data.attributes || {}),
                primary_color: generatedVariants.map((v) => v.hexCode).join(", "),
            },

            // Add tags for tracking
            tags: [
                ...(existingProduct.tags || []),
                "has-color-variants",
                ...generatedVariants.map((v) => v.hexCode.replace("#", "")),
            ],

            // Update custom JSON
            _custom_json: {
                ...(existingProduct.data._custom_json || {}),
                has_color_variants: true,
                color_variants_count: generatedVariants.length,
                color_variants: generatedVariants.map((v) => v.hexCode),
                last_updated: new Date().toISOString(),
            },
        }

        console.log(`Updating product ${uid} with ${generatedVariants.length} color variants`)
        console.log("Update payload:", JSON.stringify(updatePayload, null, 2))
        const item_id = existingProduct.data.item_id
        console.log(`Item ID: ${item_id}`)


        console.log(`https://api.fynd.com/service/platform/catalog/v2.0/company/${company_id}/products/${item_id}`);
        // Make the PUT request to update the product
        const response = await fetch(
            `https://api.fynd.com/service/platform/catalog/v2.0/company/10356/products/14090262/`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                // body: JSON.stringify(updatePayload),
            },
        )

        const responseText = await response.text()

        if (!response.ok) {
            console.error(`Failed to update product ${uid}:`, response.status, responseText)

            let errorDetails = responseText
            try {
                const errorJson = JSON.parse(responseText)
                console.error("Parsed error response:", errorJson)
                errorDetails = errorJson.message || errorJson.error || responseText
            } catch (e) {
                // Keep original error text
            }

            return {
                success: false,
                error: `HTTP ${response.status}: ${errorDetails}`,
            }
        }

        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch (e) {
            responseData = { message: "Updated successfully", raw: responseText }
        }

        console.log(`Successfully updated product ${uid} with color variants`)

        return {
            success: true,
            data: responseData,
        }
    } catch (error: any) {
        console.error(`Error updating product ${uid}:`, error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Helper endpoint to check required fields
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid")
    const accessToken = searchParams.get("accessToken")
    const company_id = searchParams.get("company_id")

    if (!uid || !accessToken || !company_id) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    try {
        const product = await getExistingProduct(Number.parseInt(uid), accessToken, Number.parseInt(company_id))

        return NextResponse.json({
            product: product.data,
            message: "Use this data to understand the product structure",
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
