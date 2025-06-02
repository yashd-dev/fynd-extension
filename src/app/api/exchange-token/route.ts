// app/api/exchange-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code, client_id, company_id } = body;

    const client_secret = process.env.NEXT_PUBLIC_NAISH_API_SECRET;
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    console.log('Exchanging token with Fynd:', auth);
    const url = `https://api.fynd.com/service/panel/authentication/v1.0/company/${company_id}/oauth/offline-token`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                client_id,
                client_secret,
                scope: 'company/products/read,company/products/write,company/inventory/read,company/brands/read,offline_access',
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Fynd token exchange failed', data);
            return NextResponse.json({ error: 'Token exchange failed', details: data }, { status: 400 });
        }

        // ✅ Optional: Store `data.access_token` and `data.refresh_token` somewhere secure

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error exchanging token:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
