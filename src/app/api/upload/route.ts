import { NextRequest, NextResponse } from 'next/server';
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";

interface SignedUrlResponse {
    presignedUrl: {
        url: string;
        fields: {
            'x-pixb-meta-assetdata': string;
        };
    };
}

const config = new PixelbinConfig({
    domain: "https://api.pixelbin.io",
    apiSecret: process.env.PIXELBIN_API_KEY,
});

const pixelbin = new PixelbinClient(config);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate signed multipart upload URL
        const signedUrlResponse = await pixelbin.assets.createSignedUrlV2({
            name: file.name,
            path: "uploads/",
            metadata: { source: "web-upload" },
            overwrite: false,
            filenameOverride: true,
            expiry: 3000,
        }) as SignedUrlResponse;

        // Upload file to Pixelbin using the signed URL
        const uploadFormData = new FormData();

        // Add the required fields from Pixelbin
        Object.entries(signedUrlResponse.presignedUrl.fields).forEach(([key, value]) => {
            uploadFormData.append(key, value);
        });

        // Add the file last (as per Pixelbin documentation)
        uploadFormData.append('file', file);

        const uploadResponse = await fetch(signedUrlResponse.presignedUrl.url, {
            method: 'POST',
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        // Parse the asset data to get the file URL
        const assetData = JSON.parse(signedUrlResponse.presignedUrl.fields['x-pixb-meta-assetdata']);
        const imageUrl = `https://cdn.pixelbin.io/v2/${config.domain?.replace('https://api.', '')}/${assetData.orgId}/${assetData.path}${assetData.name}`;

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            assetData: assetData
        });

    } catch (error) {
        console.error('Error uploading to Pixelbin:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
