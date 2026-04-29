import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import productsData from '@/data/products.json';
import { getDiscountedPrice } from '@/utils/products';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sku: string }> }
) {
    try {
        const { sku } = await params;
        if (!sku) {
            return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
        }

        // 1. Tentar buscar no banco de dados
        try {
            const res = await query('SELECT sku, price, data FROM public.products WHERE sku = $1', [sku]);

            if (res.rows.length > 0) {
                return NextResponse.json(res.rows[0]);
            }
        } catch (dbError) {
            console.warn('Database query failed, falling back to JSON:', dbError);
        }

        // 2. Fallback para products.json se não encontrar no banco ou se o banco falhar
        const productFromJson = productsData.products.find(p => p.id === sku);

        if (productFromJson) {
            // Formatar no mesmo estilo que o banco retornaria
            return NextResponse.json({
                sku: productFromJson.id,
                price: getDiscountedPrice(productFromJson as any),
                data: productFromJson
            });
        }

        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching product by sku:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

