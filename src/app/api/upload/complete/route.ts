import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, assetData, parts } = body;

    if (!url || !assetData || !parts) {
      return NextResponse.json(
        { error: 'Missing required fields: url, assetData, or parts' },
        { status: 400 }
      );
    }

    // Complete the multipart upload
    const formData = new FormData();
    formData.append('x-pixb-meta-assetdata', assetData);
    formData.append('parts', JSON.stringify(parts));

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload completion failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      asset: result
    });

  } catch (error) {
    console.error('Error completing upload:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
