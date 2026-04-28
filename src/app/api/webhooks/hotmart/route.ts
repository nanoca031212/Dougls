import { NextResponse } from 'next/server';
import { sendMetaEvent, hashData } from '@/utils/metaCapi';

// Hotmart Webhook Payload Example:
// {
//   "event": "PURCHASE_APPROVED",
//   "data": {
//     "product": { "id": 12345, "name": "Product Name" },
//     "buyer": { "email": "test@test.com", "name": "Test User", "checkout_phone": "11999999999" },
//     "purchase": { "transaction": "HP123456789", "payment": { "type": "CREDIT_CARD" }, "price": { "value": 197.0, "currency_code": "BRL" } }
//   }
// }

export async function POST(request: Request) {
    try {
        const text = await request.text();
        let payload: any = {};

        try {
            payload = JSON.parse(text);
        } catch (e) {
            // Handle URL Encoded fallback if Hotmart sends it in an older format
            const params = new URLSearchParams(text);
            payload = Object.fromEntries(params);
        }

        const event = payload.event;
        const data = payload.data || payload; // Depending on Hotmart version

        // We only care about Approved Purchases for the Purchase event
        if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
            return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
        }

        const transactionId = data.purchase?.transaction || payload.transaction;
        const currency = data.purchase?.price?.currency_code || payload.currency || 'BRL';
        const value = data.purchase?.price?.value || payload.price || 0;

        const buyerEmail = data.buyer?.email || payload.email;
        const buyerName = data.buyer?.name || payload.name;
        const buyerPhone = data.buyer?.checkout_phone || data.buyer?.phone || payload.phone;
        const productId = data.product?.id || payload.product_id;

        const userDataParams: any = {};
        if (buyerEmail) userDataParams.em = hashData(buyerEmail);
        if (buyerPhone) userDataParams.ph = hashData(buyerPhone.toString().replace(/\D/g, ''));
        if (buyerName) {
            const nameParts = buyerName.trim().split(' ');
            if (nameParts.length > 0) userDataParams.fn = hashData(nameParts[0]);
            if (nameParts.length > 1) userDataParams.ln = hashData(nameParts.slice(1).join(' '));
        }

        // Fire Meta CAPI Purchase Event
        await sendMetaEvent({
            eventName: 'Purchase',
            eventSourceUrl: `https://hotmart.com/checkout/${productId}`,
            userIp: null, // Webhook doesn't have the buyer's actual IP
            userAgent: null,
            eventId: transactionId, // Use Hotmart Transaction ID for deduplication
            userData: Object.keys(userDataParams).length > 0 ? userDataParams : undefined,
            customData: {
                currency: currency,
                value: value,
                content_ids: [productId?.toString()],
                content_type: 'product',
            }
        });

        // Fire UTMify Purchase Event (S2S)
        const utmifyToken = process.env.UTMIFY_API_TOKEN || process.env.UTMIFY_TOKEN;
        
        if (utmifyToken) {
            try {
                // Formatar data para YYYY-MM-DD HH:MM:SS
                const formatDate = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');
                const now = new Date();

                // Mapear método de pagamento
                const paymentType = data.purchase?.payment?.type || 'credit_card';
                let paymentMethod = 'credit_card';
                if (paymentType.includes('PIX')) paymentMethod = 'pix';
                else if (paymentType.includes('BILLET')) paymentMethod = 'boleto';

                const utmifyPayload = {
                    orderId: transactionId,
                    platform: "Hotmart",
                    paymentMethod: paymentMethod,
                    status: "paid",
                    createdAt: formatDate(now), // Hotmart payload might have date, defaulting to now
                    approvedDate: formatDate(now),
                    customer: {
                        name: buyerName || "Cliente",
                        email: buyerEmail || "email@naoinformado.com",
                        phone: buyerPhone ? buyerPhone.toString().replace(/\D/g, '') : "11999999999",
                    },
                    products: [{
                        id: productId?.toString() || "prod_hotmart",
                        name: data.product?.name || "Produto Hotmart",
                        planId: "1",
                        planName: "Unico"
                    }],
                    commission: {
                        value: value || 0
                    }
                    // Tracking parameters (src, sck, utms) might be in payload.hottok or separate fields
                    // Hotmart sends 'sck' or 'src' in 'purchase.sck' usually if configured
                };

                console.log('Sending payload to UTMify (Hotmart):', JSON.stringify(utmifyPayload, null, 2));

                const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-token': utmifyToken,
                    },
                    body: JSON.stringify(utmifyPayload)
                });
                
                const responseData = await response.json();
                console.log(`UTMify API response for Hotmart ${transactionId}:`, responseData);

            } catch (utmifyError) {
                console.error('Error sending UTMify event:', utmifyError);
            }
        }

        return NextResponse.json({ success: true, transaction: transactionId }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing Hotmart Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
