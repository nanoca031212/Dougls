'use client';
import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Aqui você pode adicionar a lógica para enviar o email
      console.log('Email inscrito:', email);
    }
  };

  return (
    <section className="relative text-white py-16 px-4 bg-cover bg-right bg-no-repeat" style={{backgroundImage: 'url(/foto_newsletter.avif)'}}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-2xl font-medium mb-4">
          Abonnier den Douglas-Newsletter und sicher dir einen 20%-Gutschein!!
        </h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Erfahre ab sofort alles über die neuesten Beauty-Trends und Angebote.
        </p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail-Adresse*"
                className="flex-1 px-4 py-3 bg-white text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
              >
                ANMELDEN
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-4 text-left">
              * Pflichtfeld. Mit der Anmeldung akzeptierst du unsere Datenschutzbestimmungen.
            </p>
          </form>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-green-600 text-white p-4 rounded mb-4">
              <p className="font-medium">Vielen Dank für deine Anmeldung!</p>
              <p className="text-sm">Du erhältst in Kürze eine Bestätigungs-E-Mail.</p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-sm text-gray-300 hover:text-white underline"
            >
              Weitere E-Mail anmelden
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Newsletter;