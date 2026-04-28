"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/button"
import { RadioGroup, RadioGroupItem } from "../../components/radio-group"
import { Label } from "../../components/label"
import { Trophy, DollarSign } from "lucide-react"
import PriceAnchoring from "../../components/PriceAnchoring"
import QuizHeader from "../../components/QuizHeader"
import Footer from "../../components/Footer"
import { trackQuizStep, trackQuizCompletion } from "../../utils/tracking"
import { useUTM } from "../../contexts/UTMContext"
import "../../styles/quiz-progress.css"

// Declare tipos globais para os pixels
declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      page: () => void;
      identify: (data: Record<string, unknown>) => void;
    };
    _fbq?: {
      push: (args: unknown[]) => void;
    };
    fbq?: (action: string, event: string, data?: Record<string, unknown>) => void;
    pixelId?: string;
  }
}

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "Wenn Sie das perfekte Parfüm auswählen, was ist Ihnen am wichtigsten?",
    options: ["Der Duft / die Duftnoten 🌸", "Wie lange er auf der Haut hält ⏳", "Die Marke ✨", "Der Preis 💶"],
    correct: 0,
    explanation: "Duftnoten sind das Herzstück jedes großartigen Parfüms!",
  },
  {
    id: 2,
    question: "Wo entdecken Sie normalerweise neue Parfüms?",
    options: ["In Geschäften 🏬", "In sozialen Medien 📱", "Durch Online-Werbung 💻", "Von Freunden oder Familie 👥"],
    correct: 0,
    explanation: "Geschäfte bieten die beste Erfahrung, um neue Düfte zu testen und zu entdecken!",
  },
  {
    id: 3,
    question: "Wie oft kaufen Sie ein neues Parfüm?",
    options: ["Einmal im Jahr", "Zwei- bis dreimal im Jahr", "Jede Saison (viermal im Jahr)", "Monatlich oder öfter"],
    correct: 0,
    explanation: "Sich Zeit zu nehmen, um das perfekte Parfüm zu wählen, macht jeden Kauf besonders!",
  },
  {
    id: 4,
    question: "Was beeinflusst Ihre Entscheidung am meisten beim Kauf eines neuen Parfüms?",
    options: ["Empfehlungen von Freunden oder Familie", "Online-Bewertungen", "Testen im Geschäft", "Aktionen oder Rabatte"],
    correct: 0,
    explanation: "Persönliche Empfehlungen von vertrauenswürdigen Personen sind unbezahlbar bei der Wahl von Düften!",
  },
  {
    id: 5,
    question: "Welche Art von Aktion interessiert Sie am meisten?",
    options: ["Direkter Preisnachlass", "Mehrprodukt-Sets", "Kostenlose Proben beim Kauf", "Cashback oder Treuepunkte"],
    correct: 0,
    explanation: "Direkte Rabatte bieten sofortigen Wert für Ihre Lieblingsdüfte!",
  },
  {
    id: 6,
    question: "Kaufen Sie Parfüms normalerweise eher für sich selbst oder als Geschenk?",
    options: ["Hauptsächlich für mich selbst 💆‍♀️", "Hauptsächlich als Geschenk 🎁", "Gleichermaßen für beide 🤝", "Je nach Gelegenheit 🎯"],
    correct: 0,
    explanation: "Sich selbst mit einem schönen Duft zu verwöhnen ist immer eine wunderbare Wahl!",
  },
]

// Enhanced notification component with better animations
const SuccessNotification = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setProgress(100)
      
      // Update progress every 100ms for smoother animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return prev - 2 // Decrease 2% every 100ms = 5 seconds total
        })
      }, 100)
      
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            onClose()
            setIsExiting(false)
            setProgress(100) // Reset progress
          }, 500) // Increased exit animation time
        }, 200)
      }, 5000) // Increased display time to 5 seconds

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-700 transform ${
        isVisible && !isExiting 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400 backdrop-blur-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-green-500 animate-bounce" />
        </div>
        <div>
          <p className="font-bold text-lg">Herzlichen Glückwunsch! 🎉</p>
          <p className="text-sm opacity-90">Sie haben einen 20 € Rabatt verdient!</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 h-1 bg-green-300 rounded-b-xl" style={{ 
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}></div>
      </div>
    </div>
  )
}

// Componente de vídeo simplificado
const VideoPlayer = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const { trackQuizVSLViewed } = useUTM();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const forcePlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {
            console.log("Unable to start video automatically");
          });
        });
      }
    };

    const handleError = () => {
      console.error('Video failed to load');
      setVideoError(true);
    };

    const handleVideoEnded = () => {
      // Tracking customizado quando VSL termina
      trackQuizVSLViewed();
    };

    forcePlay();
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleVideoEnded);
    setTimeout(forcePlay, 1000);

    return () => {
      video.removeEventListener('canplay', forcePlay);
      video.removeEventListener('loadeddata', forcePlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [trackQuizVSLViewed]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted) {
        // If unmuted, hide button after small delay
        setTimeout(() => {
          setShowMuteButton(false);
        }, 500);
      }
    }
  };

  if (videoError) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingBottom: '56.25%',
        backgroundColor: '#f3f4f6',
        borderRadius: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p>Video não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '25px'
        }}
        autoPlay
        playsInline
        controls={false}
        preload="auto"
        onError={() => setVideoError(true)}
      >
        <source src="videos/vsl.mp4" type="video/mp4" />
        <source src="videos/vsl.webm" type="video/webm" />
        <source src="videos/vsl.ogg" type="video/ogg" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
      {showMuteButton && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isMuted ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

// Rastrear visualização da VSL apenas uma vez globalmente
const useTrackVSLView = () => {
  useEffect(() => {
    setTimeout(() => {
      trackQuizStep('vsl_view'); // Rastrear visualização do vídeo
    }, 1000);
  }, []);
};

// Hook personalizado para gerenciar elementos escondidos (não é mais necessário)
const useAudioSystem = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAudio = () => {
      try {
        if (!audioRef.current) {
          const audio = new Audio("https://cdn.shopify.com/s/files/1/0946/2290/8699/files/notifica_o-venda.mp3?v=1749150271");
          audio.preload = "auto";
          audio.volume = 1;
          audioRef.current = audio;

          // Inicializa o contexto de áudio para dispositivos móveis
          const AudioContext = (window as Window & {
            AudioContext?: typeof window.AudioContext;
            webkitAudioContext?: typeof window.AudioContext;
          }).AudioContext || (window as Window & {
            AudioContext?: typeof window.AudioContext;
            webkitAudioContext?: typeof window.AudioContext;
          }).webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            if (audioContext.state === "suspended") {
              audioContext.resume();
            }
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Inicializa na primeira interação
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const playSound = useCallback(() => {
    try {
      if (audioRef.current && isInitialized) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [isInitialized]);

  return { playSound, isInitialized };
};

// Componente do popup de timeout
const TimeoutPopup = ({ show, onRestart, onClose }: { show: boolean; onRestart: () => void; onClose: () => void }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Zeit abgelaufen!</h2>
          <p className="text-gray-600 mb-6">
            Die Zeit für diese Frage ist abgelaufen. Möchten Sie das Quiz von vorne beginnen?
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Quiz neu starten
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
          >
            Schließen
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente do painel USP - versão minimalista Adidas
const USPPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-20 flex items-start justify-center">
      <div className="bg-white w-full max-w-4xl mt-12 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-black">WWE SummerSlam</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-px bg-gray-100">
          {/* History */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Since 1988</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              The Biggest Party
            </div>
            <div className="text-xs text-gray-500">
              Of The Summer
            </div>
          </div>

          {/* Achievements */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Legend</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              John Cena
            </div>
            <div className="text-xs text-gray-500">
              Farewell Tour
            </div>
          </div>

          {/* Legacy */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Champion</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Cody Rhodes
            </div>
            <div className="text-xs text-gray-500">
              American Nightmare
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">The Biggest Event of the Summer</div>
        </div>
      </div>
    </div>
  )
}







// Componente DiscountProgressBar corrigido
const DiscountProgressBar = ({ answeredQuestions }: { answeredQuestions: number }) => {
  const discountPerAnswer = 20; // €20 por resposta
  const maxDiscount = questions.length * discountPerAnswer; // €120 máximo (6 × 20)
  
  // Usar as perguntas respondidas para calcular o desconto
  const currentDiscount = answeredQuestions * discountPerAnswer;
  const progressPercentage = (currentDiscount / maxDiscount) * 100;

  // Estado para animação do valor
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animar o valor do desconto
  useEffect(() => {
    const duration = 1000; // 1 segundo
    const steps = 60; // 60 FPS
    const increment = currentDiscount / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(increment * currentStep, currentDiscount);
      setAnimatedValue(Math.round(newValue));
      
      if (currentStep >= steps || newValue >= currentDiscount) {
        clearInterval(timer);
        setAnimatedValue(currentDiscount);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentDiscount]);

  return (
    <div className="bg-[#ffffff] p-4 rounded-lg">
      <div className="flex justify-center items-center mb-2">
        <span className="text-sm text-gray-600 mr-2">Rabatt-Fortschritt:</span>
        <span className="font-semibold text-gray-600">€{animatedValue} / </span>
        <span className="text-[#26ca20] font-bold ml-1">€{maxDiscount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${progressPercentage}%`,
            background: 'linear-gradient(90deg, #88ff59, #1eff00, #88ff59)',
            backgroundSize: '200% 100%',
            animation: progressPercentage > 0 ? 'discountShine 2s ease-in-out infinite' : 'none'
          }}
        />
      </div>
    </div>
  );
};

// Usar o QuizHeader simplificado
const CompleteHeader = () => {
  return <QuizHeader />;
};



// Remover o MinimalHeader e USPHeader antigos e usar apenas o CompleteHeader
export default function WWESummerSlamQuiz() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUSPPanel, setShowUSPPanel] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Hook do contexto UTM para tracking
  const { 
    trackQuizStarted,
    trackQuizQuestion,
    trackQuizResultViewed,
    trackQuizRedirectToStore,
    trackQuizRedirectToStoreSuccessful,
    utmData
  } = useUTM();

  // Hook do router para navegação interna
  const router = useRouter();

  // Estilos CSS agora são importados via arquivo separado

  // Hook de captura do ttclid removido para evitar loops infinitos
  // useTikTokClickIdCapture();

  // const isPixelsReady = usePixelLoader()
  const { playSound } = useAudioSystem();
  const [progressValue, setProgressValue] = useState(100);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Modificar a função de resposta com loading e scroll automático
  const handleAnswer = useCallback(() => {
    if (isSubmitting) return
    
    // Verificar se temos uma pergunta válida
    if (currentQuestion < 0 || currentQuestion >= questions.length) {
      console.error('Current question index out of bounds:', currentQuestion, 'Total questions:', questions.length);
      return;
    }
    
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData) {
      console.error('Pergunta atual não encontrada');
      return;
    }
    
    // Se não há resposta selecionada, usar a primeira opção como padrão
    const answerToUse = selectedAnswer || '0';
    console.log('Using answer:', answerToUse, 'Selected answer was:', selectedAnswer);
    
    setIsSubmitting(true)
    const isCorrect = Number.parseInt(answerToUse) === currentQuestionData.correct

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
      playSound()
    } else {
      playSound()
    }

    // Incrementar perguntas respondidas
    setAnsweredQuestions(prev => prev + 1);

    // Tracking da resposta
    trackQuizStep(`question_${currentQuestion + 1}`, { answer: answerToUse });
    // Tracking customizado para cada pergunta
    trackQuizQuestion(currentQuestion + 1, answerToUse);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer("")
      } else {
        setQuizCompleted(true)
        const endTime = Date.now()
        const timeTaken = Math.round((endTime - startTime) / 1000)
        trackQuizCompletion({ 
          score: correctAnswers + (isCorrect ? 1 : 0),
          timeTaken: timeTaken
        });
        // Tracking customizado para visualização do resultado
        trackQuizResultViewed();
      }
      setIsSubmitting(false)
    }, 1500)
  }, [isSubmitting, currentQuestion, selectedAnswer, correctAnswers, startTime, playSound, trackQuizQuestion, trackQuizResultViewed]);

  // Função para reiniciar o quiz
  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
    setQuizCompleted(false);
    setShowNotification(false);
    setShowTimeoutPopup(false);
    setProgressValue(100);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  // Função para fechar o popup de timeout
  const handleCloseTimeoutPopup = () => {
    setShowTimeoutPopup(false);
    // Avançar para a próxima pergunta mesmo sem resposta
    setAnsweredQuestions(prev => prev + 1);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
      } else {
        setQuizCompleted(true);
      }
    }, 100);
  };

  // Timer para controlar o progresso da pergunta
  useEffect(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    if (gameStarted && !quizCompleted && currentQuestion < questions.length) {
      progressTimer.current = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (progressTimer.current) {
              clearInterval(progressTimer.current);
            }
            // Mostrar popup de timeout ao invés de avançar automaticamente
            setShowTimeoutPopup(true);
            return 0;
          }
          return newValue;
        });
      }, 100); // 10 seconds total (100 * 100ms = 10000ms)
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [gameStarted, quizCompleted, currentQuestion, handleAnswer]);

  // Reset progress value apenas quando uma nova pergunta é carregada (não quando resposta é selecionada)
  useEffect(() => {
    if (gameStarted && !quizCompleted && currentQuestion < questions.length) {
      setProgressValue(100);
    }
  }, [currentQuestion, gameStarted, quizCompleted]);

  // Rastrear visualização da pergunta quando gameStarted está true
  useEffect(() => {
    if (gameStarted && !quizCompleted) {
      trackQuizStep('question_viewed', { questionNumber: currentQuestion + 1 });
    }
  }, [currentQuestion, gameStarted, quizCompleted]);

  // Debug para verificar o estado
  useEffect(() => {
    console.log('showUSPPanel state changed:', showUSPPanel)
  }, [showUSPPanel])

  // Usar o hook de delay
  // const delayedElements = useDelayedElements()

  // Função para fechar o painel USP
  const handleUSPClose = () => {
    console.log('handleUSPClose called')
    setShowUSPPanel(false)
  }

  // Modificar a função de início do quiz com loading e scroll automático
  const handleStartQuiz = () => {
    setIsLoading(true)
    trackQuizStep('quiz_start'); // Rastrear início do quiz
    trackQuizStarted(); // Tracking customizado Quiz_Started
    
    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      setGameStarted(true)
      setStartTime(Date.now()) // Definir tempo de início
      setIsLoading(false)
      // Scroll automático para o topo ao iniciar quiz
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800)
  }

  // Função para lidar com o clique no botão de compra
  const handleBuyNowClick = () => {
    trackQuizStep('go_to_store'); // Evento final - ir para a loja
    trackQuizRedirectToStore(); // Tracking customizado Quiz_RedirectToStore
    
    // Construir URL com UTMs diretamente
    let url = "/";
    
    // Adicionar UTMs se disponíveis
    if (utmData) {
      const params = new URLSearchParams();
      
      if (utmData.utm_source) params.append('utm_source', utmData.utm_source);
      if (utmData.utm_medium) params.append('utm_medium', utmData.utm_medium);
      if (utmData.utm_campaign) params.append('utm_campaign', utmData.utm_campaign);
      if (utmData.utm_content) params.append('utm_content', utmData.utm_content);
      if (utmData.utm_term) params.append('utm_term', utmData.utm_term);
      if (utmData.gclid) params.append('gclid', utmData.gclid);
      if (utmData.fbclid) params.append('fbclid', utmData.fbclid);
      if (utmData.ttclid) params.append('ttclid', utmData.ttclid);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    // Usar navegação interna do Next.js em vez de abrir nova janela
    router.push(url);
    
    // Tracking de sucesso no redirecionamento
    trackQuizRedirectToStoreSuccessful();
  }

  useTrackVSLView(); // Comentado junto com o VSL

  // Rastrear visualização da página final
  useEffect(() => {
    if (quizCompleted) {
      trackQuizStep('final_page_viewed');
    }
  }, [quizCompleted]);

  // Initial screen with the president
  if (!gameStarted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow">
            <div className="container mx-auto px-2 py-10">
              <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-4xl font-[Playfair_Display] text-gray-900">Nachricht vom CEO von Douglas</h1>
              </div>
              
              <div className="space-y-12">
                <div className="animate-scaleIn">
                  {/* <VideoPlayer isReady={true} /> */}
                  <VideoPlayer />
                </div>

                <div className="bg-[#243b37] text-center py-5 px-5 text-sm relative rounded-xl">
                  <blockquote className="text-1xl md:text-lg text-[#ffffff] font-[Playfair_Display] text-center leading-relaxed">
                    &quot;Beantworte 6 Fragen zu deinen Parfümvorlieben und erhalte 120 € Rabatt auf ein Parfüm-Set.&quot;
                  </blockquote>
                </div>
                <Button
                  onClick={handleStartQuiz}
                  disabled={isLoading}
                  className="w-full bg-[#ffffff] border-2 border-black hover:border-[#9bdcd2] hover:bg-[#9bdcd2] text-black hover:text-white text-xl py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="md" />
                      Quiz wird gestartet...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-6 w-6" />
                      Quiz starten
                    </>
                  )}
                </Button>
                {/* Seção de envio */}
              <div className="flex justify-center items-center gap-6">
               <Image src="/shipping_images/dhl.svg" alt="DHL" width={40} height={40} className="h-12 w-auto" />
               <Image src="/shipping_images/dhl-express.svg" alt="DHL Express" width={40} height={40} className="h-12 w-auto border-1 border-gray-200" />
               <Image src="/shipping_images/hermes.svg" alt="Hermes" width={40} height={40} className="h-12 w-auto" />
               <Image src="/shipping_images/co2-neutraler-versand.svg" alt="CO2 neutraler Versand" width={40} height={40} className="h-12 w-auto" />
              </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (quizCompleted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow container mx-auto px-4 py-4">
            <div className="space-y-4">
              <div className="transform transition-all duration-500">
                <PriceAnchoring onBuyClick={handleBuyNowClick} />
              </div>

              <div className="flex flex-col gap-4">
                {/* Discount progress bar */}
                <DiscountProgressBar answeredQuestions={answeredQuestions} />
                
              </div>
            </div>
          </div>
          <BasicFooter />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <CompleteHeader />
        <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
        <div className="flex-grow container mx-auto px-1 py-5">
          <SuccessNotification show={showNotification} onClose={() => setShowNotification(false)} />

          <TimeoutPopup 
            show={showTimeoutPopup} 
            onRestart={handleRestartQuiz} 
            onClose={handleCloseTimeoutPopup} 
          />
          
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 animate-fadeIn">
              <div className="flex justify-center mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ihr Rabatt</p>
                  <p className={`text-2xl font-bold text-[#4ada12] transform transition-all duration-500 ${
                    answeredQuestions > 0 ? 'scale-125 animate-pulse' : ''
                  }`}>
                    €{answeredQuestions * 20}
                  </p>
                  <p className="text-xs text-gray-500">Teilnahmebelohnung</p>
                </div>
              </div>
              {gameStarted && !quizCompleted && (
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="animate-slideIn">
                {questions[currentQuestion] && (
                  <div className="bg-[#ffffff] p-10 rounded-xl border border-gray-900 shadow-sm transition-all duration-300 hover:shadow-md mb-4">
                    <h3 className="text-xl font-semibold mb-4 text-black border-b border-gray-900 pb-2">{questions[currentQuestion].question}</h3>

                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
                      {questions[currentQuestion].options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 cursor-pointer bg-white border border-gray-900 ${
                            selectedAnswer === index.toString() 
                              ? 'bg-gray-100 shadow-sm transform scale-105' 
                              : 'bg-gray-100 hover:transform hover:scale-105'
                          }`}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 text-black cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <Button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className={`w-full py-4 mt-3 text-white transition-all duration-200 transform hover:scale-105 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800 hover:shadow-lg'
                  }`}
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="md" />
                      Verarbeitung...
                    </div>
                  ) : (
                    "Antwort bestätigen"
                  )}
                </Button>

                {/* Discount progress bar instead of quiz progress */}
                <DiscountProgressBar answeredQuestions={answeredQuestions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Usar o Footer da store
const BasicFooter = () => <Footer />;

// Loading component for better UX
const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#4feb95] border-t-white`}></div>
  )
}