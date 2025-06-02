import { NextRequest, NextResponse } from "next/server";
import { uploadFileToPixelbin } from "@/app/lib/pixelbinUpload";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
        }

        const result = await uploadFileToPixelbin(file, {
            path: "folder1",
            format: "jpeg",
            tags: ["tag1", "tag2"],
            expiry: 3000,
        });

        return NextResponse.json({ success: true, assetUrl: result.url, metadata: result.metadata });
    } catch (err: unknown) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: "Upload failed", details: err.message }, { status: 500 });
    }
}
