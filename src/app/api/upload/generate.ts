import type { NextApiRequest, NextApiResponse } from 'next'
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";

type ResponseData = {
    url: string
}

const config = new PixelbinConfig({
    domain: "https://api.pixelbin.io",
    apiSecret: process.env.PIXELBIN_API_KEY,
});

const pixelbin = new PixelbinClient(config);

export default async function POST(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const response = await pixelbin.assets.createSignedUrlV2({
        name: `image_${Date.now()}`,
        path: "uploads/",
        format: req.body.format,
        metadata: {},
        overwrite: false,
        filenameOverride: true,
        expiry: 3000,
    });
    return { url: response.url }
}
