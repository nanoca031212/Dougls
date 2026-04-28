'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const PerfumeInfo = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setShowThankYou(true);
    // Não resetar automaticamente - deixar o usuário ver o resultado
  };

  return (
    <section className="bg-gray-50 pb-16 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Zenloop Rating Element */}
        <div className="zenloop-wrapper mb-12 bg-white">
          <style jsx>{`
            .zl-dialog {
              position: relative;
              width: 100%;
            }
            
            .zl-line {
              height: 4px;
              width: 100%;
            }
            
            .zl-page {
              padding: 24px;
            }
            
            .zl-btn-nav {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            
            .zl-close, .zl-prev {
              width: 24px;
              height: 24px;
              background: transparent;
              border: none;
              cursor: pointer;
              opacity: 0.6;
            }
            
            .zl-close:hover, .zl-prev:hover {
              opacity: 1;
            }
            
            .zl-heading {
              font-size: 18px;
              font-weight: 400;
              color: #333;
              text-align: center;
              margin-bottom: 24px;
              line-height: 1.4;
            }
            
            .zl-votes {
              display: flex;
              justify-content: center;
            }
            
            .zl-scores-extrem-wrapper {
              position: relative;
              width: 100%;
              max-width: 400px;
            }
            
            .zl-scores-emoticons {
              display: flex;
              justify-content: space-between;
              list-style: none;
              padding: 0;
              margin: 0;
              gap: 12px;
              flex-wrap: wrap;
            }
            
            .zl-scores-emoticons li {
              flex: 1;
            }
            
            .zl-score {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #ffffff;
              text-decoration: none;
              transition: all 0.3s ease;
              cursor: pointer;
            }
            
            .zl-score:hover {
              transform: scale(1.05);
              border-color: #53CDB5;
              background: #f0fffe;
            }

            .zl-score.selected {
              transform: scale(1.1);
              border-width: 4px;
            }

            .zl-score.selected.zl-promoter {
              border-color: #28a745;
              background-color: rgba(40, 167, 69, 0.1);
            }

            .zl-score.selected.zl-passive {
              border-color: #ffc107;
              background-color: rgba(255, 193, 7, 0.1);
            }

            .zl-score.selected.zl-detractor {
              border-color: #dc3545;
              background-color: rgba(220, 53, 69, 0.1);
            }

            .zl-thank-you {
              padding: 30px 20px;
              text-align: center;
              background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
              border-radius: 12px;
              margin: 20px 0;
              border: 2px solid #28a745;
              animation: fadeInScale 0.5s ease-out;
            }

            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            .zl-score-icon {
              width: 36px;
              height: 36px;
              color: #495057;
              transition: color 0.3s ease;
            }
            
            .zl-score:hover .zl-score-icon {
              color: #53CDB5;
            }
            
            .zl-promoter:hover .zl-score-icon {
              color: #28a745;
            }
            
            .zl-passive:hover .zl-score-icon {
              color: #ffc107;
            }
            
            .zl-detractor:hover .zl-score-icon {
              color: #dc3545;
            }
            
            .zl-extrem {
              display: flex;
              justify-content: space-between;
              margin-top: 12px;
              font-size: 12px;
              color: #6c757d;
            }
            
            .zl-footer {
              background: #f8f9fa;
              padding: 12px 24px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            
            .zl-footer a {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              color: #6c757d;
              text-decoration: none;
              font-size: 12px;
            }
            
            .zl-footer img {
              height: 16px;
              width: auto;
            }

            @media (max-width: 480px) {
              .zl-score {
                width: 70px;
                height: 70px;
              }
              
              .zl-score-icon {
                width: 30px;
                height: 30px;
              }
              
              .zl-scores-emoticons {
                gap: 8px;
              }
              
              .zl-page {
                padding: 20px 16px;
              }
              
              .zl-heading {
                font-size: 16px;
              }
            }
            
            @media (max-width: 640px) {
              .zl-page {
                padding: 20px 16px;
              }
              
              .zl-score {
                width: 50px;
                height: 50px;
              }
              
              .zl-score-icon {
                width: 24px;
                height: 24px;
              }
              
              .zl-heading {
                font-size: 16px;
              }
            }
          `}</style>
          <div id="zl-container">
            <div>
              <div className="zl-style-bottom zl-embed">
                <div id="zl-dialog" className="zl-dialog">
                  <div className="zl-pages">
                    <div className="zl-line" style={{backgroundColor: 'rgb(2, 25, 60)'}}></div>
                    <div style={{fontFamily: 'Inter, sans-serif'}}>
                      <div className="zl-page zl-question-page">
                        <div className="zl-btn-nav">
                          <button type="button" aria-label="Close survey" className="zl-close zl-btn-icon"></button>
                          <div className="zl-prev zl-btn-icon"></div>
                        </div>
                        <div className="zl-page-content">
                          {!showThankYou ? (
                            <>
                              <div className="zl-heading zl-question" style={{fontWeight: 400, fontStyle: 'normal', fontSize: '18px'}}>
                                Douglas zeigt mir relevante Produkte, die mich neugierig machen und inspirieren.
                              </div>
                              <div className="zl-votes zl-votes-emoticons">
                                <div className="zl-scores-extrem-wrapper">
                                  <ul className="zl-scores-emoticons">
                                    <li>
                                      <button 
                                        aria-label="Score 5" 
                                        onClick={() => handleRatingClick(5)}
                                        className={`zl-score zl-score-emoticons zl-promoter ${selectedRating === 5 ? 'selected' : ''}`}
                                      >
                                        <div>
                                          <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="laugh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="zl-score-icon">
                                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm152.7 400.7c-19.8 19.8-43 35.4-68.7 46.3-26.6 11.3-54.9 17-84.1 17s-57.5-5.7-84.1-17c-25.7-10.9-48.8-26.5-68.7-46.3-19.8-19.8-35.4-43-46.3-68.7-11.3-26.6-17-54.9-17-84.1s5.7-57.5 17-84.1c10.9-25.7 26.5-48.8 46.3-68.7 19.8-19.8 43-35.4 68.7-46.3 26.6-11.3 54.9-17 84.1-17s57.5 5.7 84.1 17c25.7 10.9 48.8 26.5 68.7 46.3 19.8 19.8 35.4 43 46.3 68.7 11.3 26.6 17 54.9 17 84.1s-5.7 57.5-17 84.1c-10.8 25.8-26.4 48.9-46.3 68.7zM328 224c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm-160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm215 64H113c-9.6 0-17.1 8.4-15.9 18 8.8 71 69.4 126 142.9 126h16c73.4 0 134-55 142.9-126 1.2-9.6-6.3-18-15.9-18zM256 400h-16c-50.2 0-93.5-33.3-107.4-80h230.8c-13.9 46.7-57.2 80-107.4 80z"></path>
                                          </svg>
                                        </div>
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        aria-label="Score 4" 
                                        onClick={() => handleRatingClick(4)}
                                        className={`zl-score zl-score-emoticons zl-passive ${selectedRating === 4 ? 'selected' : ''}`}
                                      >
                                        <div>
                                          <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="smile" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="zl-score-icon">
                                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 464c-119.1 0-216-96.9-216-216S128.9 40 248 40s216 96.9 216 216-96.9 216-216 216zm90.2-146.2C315.8 352.6 282.9 368 248 368s-67.8-15.4-90.2-42.2c-5.7-6.8-15.8-7.7-22.5-2-6.8 5.7-7.7 15.7-2 22.5C161.7 380.4 203.6 400 248 400s86.3-19.6 114.8-53.8c5.7-6.8 4.8-16.9-2-22.5-6.8-5.6-16.9-4.7-22.6 2.1zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"></path>
                                          </svg>
                                        </div>
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        aria-label="Score 3" 
                                        onClick={() => handleRatingClick(3)}
                                        className={`zl-score zl-score-emoticons zl-detractor ${selectedRating === 3 ? 'selected' : ''}`}
                                      >
                                        <div>
                                          <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="meh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="zl-score-icon">
                                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 464c-119.1 0-216-96.9-216-216S128.9 40 248 40s216 96.9 216 216-96.9 216-216 216zm-80-232c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm16 160H152c-8.8 0-16 7.2-16 16s7.2 16 16 16h192c8.8 0 16-7.2 16-16s-7.2-16-16-16z"></path>
                                          </svg>
                                        </div>
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        aria-label="Score 2" 
                                        onClick={() => handleRatingClick(2)}
                                        className={`zl-score zl-score-emoticons zl-detractor ${selectedRating === 2 ? 'selected' : ''}`}
                                      >
                                        <div>
                                          <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="frown" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="zl-score-icon">
                                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 464c-119.1 0-216-96.9-216-216S128.9 40 248 40s216 96.9 216 216-96.9 216-216 216zm0-152c-44.4 0-86.2 19.6-114.8 53.8-5.7 6.8-4.8 16.9 2 22.5 6.8 5.7 16.9 4.8 22.5-2 22.4-26.8 55.3-42.2 90.2-42.2s67.8 15.4 90.2 42.2c5.3 6.4 15.4 8 22.5 2 6.8-5.7 7.7-15.8 2-22.5C334.2 339.6 292.4 320 248 320zm-80-80c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"></path>
                                          </svg>
                                        </div>
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        aria-label="Score 1" 
                                        onClick={() => handleRatingClick(1)}
                                        className={`zl-score zl-score-emoticons zl-detractor ${selectedRating === 1 ? 'selected' : ''}`}
                                      >
                                        <div>
                                          <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="angry" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="zl-score-icon">
                                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 464c-119.1 0-216-96.9-216-216S128.9 40 248 40s216 96.9 216 216-96.9 216-216 216zm0-136c-31.2 0-60.6 13.8-80.6 37.8-5.7 6.8-4.8 16.9 2 22.5s16.9 4.8 22.5-2c27.9-33.4 84.2-33.4 112.1 0 5.3 6.4 15.4 8 22.5 2 6.8-5.7 7.7-15.8 2-22.5-19.9-24-49.3-37.8-80.5-37.8zm-48-96c0-2.9-.9-5.6-1.7-8.2.6.1 1.1.2 1.7.2 6.9 0 13.2-4.5 15.3-11.4 2.6-8.5-2.2-17.4-10.7-19.9l-80-24c-8.4-2.5-17.4 2.3-19.9 10.7-2.6 8.5 2.2 17.4 10.7 19.9l31 9.3c-6.3 5.8-10.5 14.1-10.5 23.4 0 17.7 14.3 32 32 32s32.1-14.3 32.1-32zm171.4-63.3l-80 24c-8.5 2.5-13.3 11.5-10.7 19.9 2.1 6.9 8.4 11.4 15.3 11.4.6 0 1.1-.2 1.7-.2-.7 2.7-1.7 5.3-1.7 8.2 0 17.7 14.3 32 32 32s32-14.3 32-32c0-9.3-4.1-17.5-10.5-23.4l31-9.3c8.5-2.5 13.3-11.5 10.7-19.9-2.4-8.5-11.4-13.2-19.8-10.7z"></path>
                                          </svg>
                                        </div>
                                      </button>
                                    </li>
                                  </ul>
                              <div className="zl-extrem zl-extrem-emoticons zl-extrem-emoticons-1">
                                <div className="zl-extrem-left"></div>
                                <div className="zl-extrem-right"></div>
                             </div>
                           </div>
                         </div>
                         </>
                       ) : (
                         <div className="zl-thank-you">
                           <div className="zl-heading" style={{fontWeight: 600, fontStyle: 'normal', fontSize: '20px', textAlign: 'center', color: '#155724'}}>
                             ✓ Vielen Dank für Ihr Feedback!
                           </div>
                           <div style={{textAlign: 'center', marginTop: '12px', fontSize: '15px', color: '#155724'}}>
                             Ihre Bewertung hilft uns, unseren Service zu verbessern.
                           </div>
                           <button 
                             onClick={() => {
                               setShowThankYou(false);
                               setSelectedRating(null);
                             }}
                             style={{
                               marginTop: '20px',
                               padding: '10px 20px',
                               background: '#28a745',
                               color: 'white',
                               border: 'none',
                               borderRadius: '6px',
                               cursor: 'pointer',
                               fontSize: '14px',
                               fontWeight: '500',
                               transition: 'background 0.2s ease'
                             }}
                             onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#218838'}
                             onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#28a745'}
                           >
                             Neue Bewertung abgeben
                           </button>
                         </div>
                       )}
                     </div>
                      </div>
                    </div>
                    <div className="zl-footer">
                      <a target="_blank" href="https://www.zenloop.com/de/survey_brand?utm_source=website-embed&utm_medium=survey-branding&utm_campaign=1063" rel="noopener noreferrer">
                        Powered by <Image src="https://assets.zenloop.com/logo/zenloop-footer.svg" alt="zenloop" width={60} height={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção sobre tipos de notas */}
        <div className="mb-12 bg-white pt-5">
          <h2 className="text-2xl font-medium text-black uppercase mb-8 right px-5">
            WAS UNTERSCHEIDET EAU DE TOILETTE, EAU DE PARFUM UND CO.?
          </h2>
          <p className="text-gray-700 mb-6 px-4 leading-relaxed">
            Der Unterschied liegt in der Duftöl-Konzentration. Diese bestimmt die Intensität und die Haltbarkeit des Duftes. Hier ist der Überblick über den Duftölgehalt in verschiedenen Parfümtypen:
          </p>
          <div className="grid gap-4 px-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-black mb-2">Extrait de Parfum</h3>
              <p className="text-gray-600 font-semibold">15-40%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-black mb-2">Eau de Parfum (EdP)</h3>
              <p className="text-gray-600 font-semibold">8-15%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-black mb-2">Eau de Toilette (EdT)</h3>
              <p className="text-gray-600 font-semibold">6-8%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-black mb-2">Eau de Cologne</h3>
              <p className="text-gray-600 font-semibold">3-6%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-black mb-2">Eau de Fraîche</h3>
              <p className="text-gray-600 font-semibold">&lt; 3%</p>
            </div>
          </div>
        </div>

        {/* Seção sobre durabilidade */}
        <div className="mb-12 bg-white pt-5">
          <h2 className="text-2xl font-medium text-black uppercase mb-8 text-center px-4">
            WIE HÄLT PARFÜM AM LÄNGSTEN?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed px-4">
            Wie intensiv und langanhaltend der Duft ist, kannst du neben der Wahl der Duftkonzentration dadurch beeinflussen, wo du das Parfüm aufsprühst: Am schnellsten und intensivsten entfalten sich Düfte generell an Stellen, an denen die Haut gut durchblutet und warm ist wie an Hals, Nacken und Dekolleté oder an Armbeuge und Handgelenk. An kühleren Körperregionen wie den Ohrläppchen sind Düfte dagegen besonders langanhaltend.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-gray-700">
              <strong>Tipp:</strong> Parfüm nicht verreiben – die Reibung erzeugt Hitze und verändert dabei den Duft. Lass das Parfüm an der Luft trocknen oder klopfe es nur leicht ein.
            </p>
          </div>
        </div>

        {/* Seção sobre pirâmide olfativa */}
        <div>
          <h2 className="text-2xl font-medium text-black uppercase mb-8 text-center px-4">
            PARFÜM ONLINE KAUFEN - MITHILFE DER DUFTPYRAMIDE
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed px-4">
            Ein hochwertiges Parfüm wird mit der gleichen Präzision wie ein kostbares Musikstück komponiert. Es besteht üblicherweise aus 150 bis 250 verschiedenen Komponenten, die gemeinsam die Duftnoten – Kopf, Herz und Basis – formen, welche die sogenannte Duftpyramide aufbauen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PerfumeInfo;