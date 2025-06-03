// app/api/inventories/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { accessToken, companyId } = body;

    if (!accessToken || !companyId) {
        return NextResponse.json({ error: 'Missing access token or company ID' }, { status: 400 });
    }

    const url = `https://api.fynd.com/service/platform/catalog/v1.0/company/${companyId}/products`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
