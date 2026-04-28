import { NextResponse } from 'next/server';
import { query } from '@/utils/db'; // Make sure the path aliases align with tsconfig

export async function GET() {
    try {
        const res = await query('SELECT sku, product_id, variant_id, price, currency, stock, data FROM public.products');
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
