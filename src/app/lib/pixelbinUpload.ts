import { PixelbinClient, PixelbinConfig } from "@pixelbin/admin";
import axios from "axios";

const config = new PixelbinConfig({
    domain: "https://api.pixelbin.io",
    apiSecret: process.env.PIXELBIN_API_TOKEN || "your_api_secret_here",
});
const pixelbin = new PixelbinClient(config);

function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks = [];
    let offset = 0;
    while (offset < buffer.length) {
        chunks.push(buffer.slice(offset, offset + chunkSize));
        offset += chunkSize;
    }
    return chunks;
}

export async function uploadFileToPixelbin(file: File, options?: {
    path?: string;
    format?: string;
    tags?: string[];
    metadata?: object;
    overwrite?: boolean;
    filenameOverride?: boolean;
    expiry?: number;
}) {
    if (!file) throw new Error("No file provided");

    const {
        path = "folder1",
        format = "jpeg",
        tags = [],
        metadata = {},
        overwrite = false,
        filenameOverride = true,
        expiry = 3000,
    } = options || {};

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get signed upload URL & fields from Pixelbin
    const response = await pixelbin.assets.createSignedUrlV2({
        name: file.name,
        path,
        format,
        tags,
        metadata,
        overwrite,
        filenameOverride,
        expiry,
    });

    const uploadId = response.presignedUrl.fields["x-pixb-meta-assetdata"];
    const url = response?.presignedUrl.url;

    if (!url) throw new Error("Failed to get upload URL");
    if (!uploadId) throw new Error("Missing asset metadata");

    // Chunk size (5MB)
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const parts = chunkBuffer(buffer, CHUNK_SIZE);

    // Upload each chunk in parallel
    await Promise.all(
        parts.map(async (partBuffer, index) => {
            const partNumber = index + 1;
            const uploadUrl = `${url}&partNumber=${partNumber}`;

            const form = new FormData();
            form.append("x-pixb-meta-assetdata", uploadId);
            form.append("file", new Blob([partBuffer]), file.name);

            const headers = form.getHeaders?.() || { "Content-Type": "multipart/form-data" };

            const res = await axios.put(uploadUrl, form, {
                headers,
                validateStatus: () => true,
            });

            if (res.status !== 204) {
                throw new Error(`Upload failed for part ${partNumber}: ${res.statusText}`);
            }
        })
    );

    // Finalize multipart upload
    const completeRes = await axios.post(
        url,
        {
            "x-pixb-meta-assetdata": uploadId,
            parts: parts.map((_, i) => i + 1),
        },
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    if (completeRes.status !== 200) {
        throw new Error("Finalization failed: " + completeRes.statusText);
    }

    return {
        url: completeRes.data.url,
        metadata: completeRes.data,
    };
}
