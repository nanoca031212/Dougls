import crypto from 'crypto';

export interface MetaEventData {
    eventName: string;
    eventId?: string;
    eventTime?: number;
    eventSourceUrl: string;
    userIp: string | null;
    userAgent: string | null;
    fbc?: string | null;
    fbp?: string | null;
    actionSource?: 'website' | 'app' | 'physical_store' | 'system_generated' | 'other';
    customData?: any;
    userData?: any;
}

/**
 * Send an event to Meta Conversions API
 */
export async function sendMetaEvent(data: MetaEventData) {
    const META_PIXEL_ID = process.env.META_PIXEL_ID;
    const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN;

    if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
        console.warn('Meta CAPI is not configured. Missing META_PIXEL_ID or META_CAPI_TOKEN.');
        return null;
    }

    const payload = {
        data: [
            {
                event_name: data.eventName,
                event_id: data.eventId,
                event_time: data.eventTime || Math.floor(Date.now() / 1000),
                action_source: data.actionSource || 'website',
                event_source_url: data.eventSourceUrl,
                user_data: {
                    client_ip_address: data.userIp,
                    client_user_agent: data.userAgent,
                    ...(data.fbc ? { fbc: data.fbc } : {}),
                    ...(data.fbp ? { fbp: data.fbp } : {}),
                    ...data.userData,
                },
                custom_data: data.customData || {},
            },
        ],
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            console.error('Meta CAPI Error:', result);
        } else {
            console.log(`Meta CAPI Success [${data.eventName}]:`, result);
        }
        return result;
    } catch (error) {
        console.error('Meta CAPI Request Failed:', error);
        return null;
    }
}

/**
 * Utility to hash data using SHA-256 for Meta User Data parameters
 */
export function hashData(data: string): string {
    if (!data) return '';
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}
