'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useUTM } from '@/contexts/UTMContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Make sure to call `loadStripe` outside of a component's render to avoid recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'dummy_key_to_avoid_crash_if_missing');

export default function CheckoutPage() {
    const [step, setStep] = useState<'contact' | 'payment'>('contact');
    const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
    const [clientSecret, setClientSecret] = useState<string>('');
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    const { state, clearCart } = useCart();
    const { utmData, trackEcommerce } = useUTM();
    const router = useRouter();

    useEffect(() => {
        if (state.items.length === 0) {
            router.push('/');
        }
    }, [state.items, router]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingPayment(true);

        const itemsPayload = state.items.map(item => ({
            sku: item.product_id.toString(),
            quantity: item.quantity
        }));

        fetch('/api/checkout/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: itemsPayload, utmData, contactData })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                    setStep('payment');

                    // Fire Client-Side InitiateCheckout with deduplication ID
                    trackEcommerce('initiate_checkout', {
                        value: state.totalPrice,
                        items: itemsPayload.map(i => ({ item_id: i.sku, quantity: i.quantity }))
                    }, data.eventId); // Ensure we pass the API-returned eventId

                } else {
                    console.error("Failed to fetch intent:", data.error);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setIsLoadingPayment(false));
    };

    if (state.items.length === 0) return null; // Handle empty cart correctly

    if (step === 'payment' && !clientSecret) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    const options = {
        clientSecret,
    };

    return (
        <div className="min-h-screen mx-auto sm:px-6 lg:px-8 overflow-visible pb-16">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-4 sm:p-8 pb-20 relative z-10">
                <div className="flex col col-2 justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#000" viewBox="1 0 129 25" className="h-10 w-auto max-w-[150px]">
                        <path fillRule="evenodd" d="M68.201 15.025v-2.14l13.308-.001c.067 6.289-4.57 10.972-11.04 10.972-6.837 0-11.64-4.965-11.64-11.942C58.83 5.156 63.8.038 70.47.038c4.937 0 9.039 2.81 10.44 7.326h-2.435C77.14 4.086 74.138 2.18 70.469 2.18c-5.47 0-9.371 4.08-9.371 9.734 0 5.673 3.835 9.735 9.371 9.735 4.37 0 7.671-2.643 8.505-6.624H68.201Zm-49.06-13.18A11.468 11.468 0 0 1 25.378.04c6.703 0 11.739 5.118 11.739 11.91 0 6.79-5.036 11.909-11.74 11.909-6.77 0-11.672-5.018-11.672-11.91a12.018 12.018 0 0 1 1.767-6.322c.61.444 1.131 1 1.534 1.639a10.62 10.62 0 0 0-1.033 4.683c0 5.654 3.935 9.702 9.405 9.702 5.536 0 9.472-4.048 9.472-9.702 0-5.687-3.936-9.768-9.472-9.768a9.521 9.521 0 0 0-4.703 1.171 9.348 9.348 0 0 0-1.534-1.505Zm34.886 15.523c.25-.927.373-1.884.367-2.844V.508h2.268v14.184c0 1.17-.166 2.609-.467 3.545-1.134 3.48-3.969 5.62-8.238 5.62-4.27 0-7.137-2.074-8.238-5.553a13.001 13.001 0 0 1-.5-3.546V.508h2.268v14.016c-.006.96.117 1.917.366 2.844.8 2.743 3.069 4.282 6.07 4.282 3.035 0 5.304-1.54 6.104-4.282Zm-39.155 2.977a8.705 8.705 0 0 1-1.935.602 17.575 17.575 0 0 1-3.635.302H2.398V2.615h6.904a17.573 17.573 0 0 1 3.635.302c4.37.936 6.77 4.114 6.77 9.032a11.16 11.16 0 0 1-.933 4.683c.408.654.915 1.24 1.5 1.74 1.101-1.807 1.702-4.014 1.702-6.423 0-5.954-3.135-9.902-8.472-11.073A17.67 17.67 0 0 0 9.636.508H.13V23.39h9.506c1.297.03 2.595-.082 3.868-.334a11.244 11.244 0 0 0 2.868-1.037 7.186 7.186 0 0 1-1.5-1.673ZM120.764 9.94l2.402 1.171c2.467 1.204 4.834 2.845 4.834 6.491 0 3.646-2.601 6.256-6.503 6.256-4.002 0-6.87-2.342-7.237-7.393h2.269c.4 3.645 2.335 5.184 5.003 5.184 2.467 0 4.135-1.606 4.135-3.947 0-2.342-1.568-3.647-3.302-4.45l-2.434-1.138c-2.83-1.32-4.636-3.228-4.636-6.22 0-3.28 2.468-5.855 6.037-5.855 3.234 0 5.802 1.974 6.203 6.39H125.4c-.366-2.643-1.701-4.316-4.069-4.316-2.301 0-3.769 1.539-3.769 3.68 0 1.921 1.16 3.152 3.202 4.147ZM103.321.508l-8.838 22.881h2.535l2.701-7.258h9.405l2.735 7.258h2.602L105.589.508h-2.268Zm-2.802 13.48h7.805l-2.602-7.024a81.731 81.731 0 0 1-1.3-3.714c-.4 1.238-.801 2.476-1.268 3.714l-2.635 7.025ZM85.945.509h-2.268v22.881h9.138l.9-2.14h-7.77V.507Z" clipRule="evenodd" />
                    </svg>
                </div>

                {step === 'contact' && (
                    <div className="mt-4 animate-fade-in">
                        <h1 className="text-xl text-center justify-center font-sans mx-15 text-gray-900 mb-2 font-primary font-bold border-b border-gray-400 pb-3">Kontaktinformationen</h1>
                        <p className="text-gray-500 mb-2 text-center sm:text-sm pt-4">Bitte geben Sie Ihre Daten ein, um eine reibungslose Lieferung zu gewährleisten.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 mx-auto">
                            {/* Order Summary & Images */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Ihre Bestellung</h2>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {state.items.map((item) => (
                                        <div key={item.product_id} className="flex items-center space-x-4">
                                            <div className="relative w-16 h-16 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                                                <Image
                                                    src={item.image || '/images/placeholder.png'}
                                                    alt={item.title}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                <p className="text-sm text-gray-500">Menge: {item.quantity}</p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                €{((parseFloat(item.price) * item.quantity)).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-base font-semibold text-gray-900">Gesamt</span>
                                    <span className="text-lg font-bold text-gray-900">€{(state.totalPrice).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <form onSubmit={handleContactSubmit} className="space-y-4 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name</label>
                                    <input required type="text" id="name" value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                                    <input required type="email" id="email" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
                                    <input required type="tel" id="phone" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors" placeholder="+49 151 2345678" />
                                </div>

                                <div className="pt-4">
                                    <button type="submit" disabled={isLoadingPayment} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]">
                                        {isLoadingPayment ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Wird bearbeitet...
                                            </span>
                                        ) : 'Weiter zur Zahlung'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {step === 'payment' && clientSecret && (
                    <div className="mt-4">
                        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                            <EmbeddedCheckout />
                        </EmbeddedCheckoutProvider>
                    </div>
                )}
            </div>

            {/* Floating Progress Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
                <div className="h-2 w-full bg-gray-100 overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-[#9BDCD2] via-[#9BDCD2] to-[#9BDCD2] transition-all duration-1000 ease-out absolute top-0 left-0"
                        style={{ width: step === 'contact' ? '50%' : '80%' }}
                    >
                        {/* Shimmer effect inside the bar */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 blur-[2px] -skew-x-[35deg] animate-[shimmer_2s_infinite_linear] translate-x-[-150%]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center px-4 py-3 text-xs font-semibold text-gray-500 max-w-2xl mx-auto uppercase tracking-wider">
                    <span className={step === 'contact' ? 'text-[#4ea195]' : ''}>1. Kontakt</span>
                    <span className={step === 'payment' ? 'text-[#4ea195]' : ''}>2. Zahlung</span>
                    <span>3. Bestätigung</span>
                </div>
            </div>

        </div>
    );
}
