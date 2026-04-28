import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12 border-t-1 border-[#13ce67]">
      <div className="max-w-6xl mx-auto">
        {/* Seção de entrega e custos */}
        <div className="flex justify-center md:grid-cols-2 gap-8 mb-12">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l3-3-3-3" />
              </svg>
            </div>
            <h3 className="font-medium text-black mb-2">Schnelle Lieferung</h3>
            <p className="text-gray-600 text-sm">
              1-3 Werktage Lieferzeit
            </p>
            <p className="text-gray-600 text-sm">
              ab 29€ versandkostenfrei
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h3 className="font-medium text-black mb-2">Versandkostenfrei</h3>
            <p className="text-gray-600 text-sm">
              ab 29€ Bestellwert
            </p>
            <p className="text-gray-600 text-sm">
              in 24.056 Filialen abholbar
            </p>
          </div>
        </div>

        {/* Links principais */}
        <div className="grid md:grid-cols-4 gap-8 mb-8 px-2">
          <div>
            <h4 className="font-medium text-black mb-4">Kundenservice</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">Kontakt</a></li>
              <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Lieferung & Versand</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Rückgabe & Umtausch</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-black mb-4">Über Douglas</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">Unternehmen</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Karriere</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Presse</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Nachhaltigkeit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-black mb-4">Kategorien</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">Parfüm</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Make-up</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Hautpflege</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Haarpflege</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-black mb-4">Mein Konto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">Anmelden</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Registrieren</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Bestellungen</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Wunschliste</a></li>
            </ul>
          </div>
        </div>

        {/* Seção de métodos de pagamento */}
        <div className="border-t border-gray-300 pt-8 mb-8">
          <div className="text-center">
            <h4 className="font-medium text-black mb-4">Sicher bezahlen</h4>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
              <Image src="/payment/visa.svg" alt="Visa" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/mastercard.svg" alt="Mastercard" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/amex.svg" alt="American Express" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/paypal.svg" alt="PayPal" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/klarna.svg" alt="Klarna" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/applepay.svg" alt="Apple Pay" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/diners.svg" alt="Diners Club" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/discover.svg" alt="Discover" width={32} height={32} className="h-8 w-auto" />
            </div>
            <div className="flex justify-center items-center gap-4">
              <Image src="/payment/rechnung.svg" alt="Rechnung" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/gutscheinkarte.svg" alt="Gutscheinkarte" width={32} height={32} className="h-8 w-auto" />
              <Image src="/payment/beauty-card-premium.svg" alt="Beauty Card Premium" width={32} height={32} className="h-8 w-auto" />
            </div>
          </div>
        </div>

        {/* Seção de envio */}
        <div className="border-t border-gray-300 pt-8 mb-8">
          <div className="text-center">
            <h4 className="font-medium text-black mb-4">Schnell versendet</h4>
            <div className="flex justify-center items-center gap-6">
              <Image src="/shipping_images/dhl.svg" alt="DHL" width={40} height={40} className="h-10 w-auto" />
              <Image src="/shipping_images/dhl-express.svg" alt="DHL Express" width={40} height={40} className="h-10 w-auto" />
              <Image src="/shipping_images/hermes.svg" alt="Hermes" width={40} height={40} className="h-10 w-auto" />
              <Image src="/shipping_images/co2-neutraler-versand.svg" alt="CO2 neutraler Versand" width={40} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-sm text-gray-600 mt-4">Alle Preise inkl. gesetzl. MwSt zzgl. <a href="#" className="text-blue-600 hover:underline">Versandkosten</a>.</p>
          </div>
        </div>

        {/* Seção de apps */}
        <div className="pt-8 mb-8">
          <div className="text-center">
            <h4 className="font-medium text-black mb-4">Douglas App</h4>
            <div className="flex justify-center items-center gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/app_images/google-play-store.svg" alt="Google Play Store" width={48} height={48} className="h-12 w-auto" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/app_images/apple-store.svg" alt="App Store" width={48} height={48} className="h-12 w-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Redes sociais */}
        <div className="pt-8">
          <div className="text-center">
            <h4 className="font-medium text-black mb-4">Douglas folgen</h4>
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/facebook.svg" alt="Facebook" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/instagram.svg" alt="Instagram" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/youtube.svg" alt="YouTube" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/pinterest.svg" alt="Pinterest" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/tiktok.svg" alt="TikTok" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/linkedin.svg" alt="LinkedIn" width={32} height={32} className="w-8 h-8" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/general_images/x.svg" alt="X (Twitter)" width={32} height={32} className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 pt-6 mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2024 Douglas. Alle Rechte vorbehalten. | 
            <a href="#" className="hover:text-black transition-colors ml-1">Datenschutz</a> | 
            <a href="#" className="hover:text-black transition-colors ml-1">AGB</a> | 
            <a href="#" className="hover:text-black transition-colors ml-1">Impressum</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;