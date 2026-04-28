'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTracking } from '@/contexts/UTMContext';
import { Package } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const { trackEcommerce } = useTracking();
    const [status, setStatus] = useState<string>('loading');
    const [orderDetails, setOrderDetails] = useState<any>(null);

    // Stripe Embedded Checkout uses session_id
    const return_id = searchParams.get('return_id') || searchParams.get('payment_intent') || searchParams.get('session_id');


    useEffect(() => {
        if (!return_id) {
            setStatus('error');
            return;
        }

        const validateOrder = async () => {
            try {
                const res = await fetch(`/api/order/${return_id}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to fetch order');
                }

                setOrderDetails(data);

                if (data.status === 'succeeded') {
                    setStatus('success');
                    console.log('Order validated successfully. Tracking handled server-side.');

                    // Meta Pixel Client-Side Tracking (Deduplication with Server-Side)
                    if (typeof window !== 'undefined' && (window as any).fbq) {
                        (window as any).fbq('track', 'Purchase', {
                            currency: data.currency ? data.currency.toUpperCase() : 'EUR',
                            value: data.amount ? data.amount / 100 : 0,
                            content_ids: data.lineItems ? data.lineItems.map((item: any) => item.id || item.name) : [],
                            content_type: 'product',
                        }, { eventID: return_id });
                        console.log('Meta Pixel Purchase event fired client-side for deduplication.');
                    }
                } else if (data.status === 'processing') {
                    setStatus('processing');
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        validateOrder();
    }, [return_id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
                {status === 'loading' && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <h2 className="mt-6 text-xl font-semibold text-gray-900">Validating Payment...</h2>
                        <p className="mt-2 text-gray-500">Please wait while we confirm your order.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-200 mb-6">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
                        {orderDetails && (
                            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-600 flex justify-between mb-4">
                                    <span className="font-medium text-gray-500">Amount Paid:</span>
                                    <span className="text-gray-900 font-semibold">{((orderDetails.amount) / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}</span>
                                </p>

                                {orderDetails.lineItems && orderDetails.lineItems.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h3>
                                        <div className="space-y-3">
                                            {orderDetails.lineItems.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center border border-gray-200">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {((item.amount_total) / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <a href="/" className="inline-block w-full bg-black text-white rounded-lg py-3 px-4 font-medium hover:bg-gray-800 transition-colors">
                            Continue Shopping
                        </a>
                    </div>
                )}

                {status === 'processing' && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                        <h2 className="mt-6 text-xl font-semibold text-gray-900">Payment Processing</h2>
                        <p className="mt-2 text-gray-500">Your payment is still being processed by the provider.</p>
                    </div>
                )}

                {(status === 'failed' || status === 'error') && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Payment Unsuccessful</h2>
                        <p className="mt-2 text-gray-500">There was an issue verifying your payment. Please try again or contact support.</p>
                        <a href="/checkout" className="mt-6 inline-block w-full border border-gray-300 rounded-lg py-3 px-4 font-medium hover:bg-gray-50 transition-colors">
                            Return to Checkout
                        </a>
                    </div>
                )}
            </div>

            {/* Floating Progress Bar - 100% Success */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
                <div className="h-2 w-full bg-gray-100 overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-[rgba(59,246,143,1)] via-blue-300 to-blue-500 transition-all duration-1000 ease-out absolute top-0 left-0 w-full"
                    >
                        {/* Shimmer effect inside the bar */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 blur-[2px] -skew-x-[35deg] animate-[shimmer_2s_infinite] translate-x-[-150%]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center px-4 py-3 text-xs font-semibold text-gray-500 max-w-2xl mx-auto uppercase tracking-wider">
                    <span>1. Kontakt</span>
                    <span>2. Zahlung</span>
                    <span className="text-green-600">3. Bestätigung</span>
                </div>
            </div>

        </div>
    );
}
