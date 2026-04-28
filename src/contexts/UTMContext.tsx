'use client';

import React, { createContext, useContext, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { useUTMCapture, UTMData, DataLayer } from '@/hooks/useUTMCapture';
import { dataLayerManager } from '@/utils/dataLayer';

// Interfaces para tipagem adequada
interface TrackingEventData {
  [key: string]: string | number | boolean | object | undefined;
}

interface QuizStepData {
  step?: string;
  answer?: string;
  questionNumber?: number;
  [key: string]: string | number | boolean | undefined;
}

interface QuizResultData {
  result?: string;
  score?: number;
  recommendations?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

interface ProductData {
  id: string;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  brand?: string;
  variant?: string;
  [key: string]: string | number | boolean | undefined;
}

interface EcommerceItem {
  item_id?: string;
  id?: string;
  item_name?: string;
  name?: string;
  category?: string;
  quantity?: number;
  price?: number;
  currency?: string;
  [key: string]: string | number | boolean | undefined;
}

interface EcommerceData {
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: EcommerceItem[];
  num_items?: number;
  [key: string]: string | number | boolean | EcommerceItem[] | undefined;
}

interface WindowWithTracking extends Window {
  fbq?: (action: string, event: string, data?: object, options?: object) => void;
  gtag?: (command: string, event: string, data?: object) => void;
  utmify?: {
    track: (event: string, data?: object) => void;
  };
  pixelId?: string;
}

interface UTMContextType {
  utmData: UTMData;
  dataLayer: DataLayer | null;
  hasUTMs: boolean;
  clearUTMData: () => void;
  updateUTMData: (newData: Partial<UTMData>) => void;
  // Funções de tracking integradas
  trackEvent: (event: string, data?: TrackingEventData) => void;
  trackPageView: () => void;
  trackQuizStep: (step: string, data?: QuizStepData) => void;
  trackQuizCompleted: (data?: QuizResultData) => void;
  trackEcommerce: (
    event: 'add_to_cart' | 'initiate_checkout' | 'purchase',
    ecommerce: EcommerceData,
    eventId?: string
  ) => void;
  // Novas funções específicas para eventos customizados do Quiz
  trackQuizPageView: () => void;
  trackQuizVSLViewed: () => void;
  trackQuizStarted: () => void;
  trackQuizQuestion: (questionNumber: number, answer?: string) => void;
  trackQuizResultViewed: (result?: QuizResultData) => void;
  trackQuizRedirectToStore: () => void;
  trackQuizRedirectToStoreSuccessful: () => void;
  // Novas funções para eventos nativos da Store
  trackStoreProductViewed: (productData: ProductData) => void;
}

const UTMContext = createContext<UTMContextType | undefined>(undefined);

interface UTMProviderProps {
  children: ReactNode;
  enableGA4?: boolean;
  ga4MeasurementId?: string;
  enableMetaPixel?: boolean;
  enableUtmify?: boolean;
  enableConsoleLog?: boolean;
}

export const UTMProvider: React.FC<UTMProviderProps> = ({
  children,
  enableGA4 = false,
  ga4MeasurementId,
  enableMetaPixel = true,
  enableUtmify = true,
  enableConsoleLog = true
}) => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UTMProviderInner
        enableGA4={enableGA4}
        ga4MeasurementId={ga4MeasurementId}
        enableMetaPixel={enableMetaPixel}
        enableUtmify={enableUtmify}
        enableConsoleLog={enableConsoleLog}
      >
        {children}
      </UTMProviderInner>
    </Suspense>
  );
};

const UTMProviderInner: React.FC<UTMProviderProps> = ({
  children,
  enableGA4 = false,
  ga4MeasurementId,
  enableMetaPixel = true,
  enableUtmify = true,
  enableConsoleLog = true
}) => {
  const {
    utmData,
    dataLayer,
    hasUTMs,
    clearUTMData,
    updateUTMData
  } = useUTMCapture();

  // Sincronizar UTMs com o data layer manager
  useEffect(() => {
    if (hasUTMs) {
      dataLayerManager.setUTMData(utmData);

      // Enviar para diferentes plataformas se habilitadas
      if (enableGA4 && ga4MeasurementId) {
        dataLayerManager.sendToGA4(ga4MeasurementId);
      }

      // Removido sendToMetaPixel() aqui para evitar duplicação
      // O evento UTMCaptured é enviado diretamente no useEffect abaixo

      if (enableUtmify) {
        dataLayerManager.sendToUtmify();
      }

      if (enableConsoleLog) {
        console.log('UTMs capturados:', utmData);
        console.log('Data Layer completo:', dataLayer);
      }
    }
  }, [utmData, hasUTMs, enableGA4, ga4MeasurementId, enableMetaPixel, enableUtmify, enableConsoleLog, dataLayer]);

  // Função genérica para tracking de eventos
  const trackEvent = useCallback((event: string, data?: TrackingEventData) => {
    const eventData = {
      event,
      ...data,
      utm_data: utmData,
      timestamp: Date.now()
    };

    dataLayerManager.push(eventData);

    // Enviar para Meta Pixel se habilitado
    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', event, eventData);
    }

    // Enviar para Utmify se habilitado
    if (enableUtmify && typeof window !== 'undefined' && (window as WindowWithTracking).utmify) {
      (window as WindowWithTracking).utmify!.track(event, eventData);
    }

    // Enviar para GA4 se habilitado
    if (enableGA4 && typeof window !== 'undefined' && (window as WindowWithTracking).gtag) {
      (window as WindowWithTracking).gtag!('event', event, eventData);
    }
  }, [utmData, enableMetaPixel, enableUtmify, enableGA4]);

  // Funções específicas para eventos customizados do Quiz
  // Função auxiliar para criar dados de evento com informações aprimoradas
  const createEnhancedEventData = (customData: Record<string, number | string | boolean | object | undefined> = {}) => {
    return {
      ...customData,
      utm_data: utmData,
      dataLayer: dataLayer, // Inclui todos os dados aprimorados do dispositivo
      timestamp: Date.now()
    };
  };

  const trackQuizPageView = () => {
    const eventData = createEnhancedEventData();
    dataLayerManager.push({ event: 'Quiz_PageView', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_PageView', eventData);
    }
  };

  const trackQuizVSLViewed = () => {
    const eventData = createEnhancedEventData();
    dataLayerManager.push({ event: 'Quiz_VSLViewed', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_VSLViewed', eventData);
    }
  };

  const trackQuizStarted = () => {
    const eventData = createEnhancedEventData();
    dataLayerManager.push({ event: 'Quiz_Started', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_Started', eventData);
    }
  };

  const trackQuizQuestion = (questionNumber: number, answer?: string) => {
    const eventName = `Quiz_Question${questionNumber}`;
    const eventData = createEnhancedEventData({
      question_number: questionNumber,
      answer: answer
    });

    dataLayerManager.push({ event: eventName, ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', eventName, eventData);
    }
  };

  const trackQuizResultViewed = (result?: QuizResultData) => {
    const eventData = createEnhancedEventData({ result });

    dataLayerManager.push({ event: 'Quiz_ResultViewed', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_ResultViewed', eventData);
    }
  };

  const trackQuizRedirectToStore = () => {
    const eventData = createEnhancedEventData();
    dataLayerManager.push({ event: 'Quiz_RedirectToStore', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_RedirectToStore', eventData);
    }
  };

  const trackQuizRedirectToStoreSuccessful = () => {
    const eventData = createEnhancedEventData();
    dataLayerManager.push({ event: 'Quiz_RedirectToStoreSuccessful', ...eventData });

    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('trackCustom', 'Quiz_RedirectToStoreSuccessful', eventData);
    }
  };

  // Função para eventos nativos da Store
  const trackStoreProductViewed = (productData: ProductData) => {
    const eventData = createEnhancedEventData({
      product_id: productData.id,
      product_name: productData.name,
      category: productData.category,
      price: productData.price,
      currency: productData.currency || 'EUR'
    });

    dataLayerManager.push({ event: 'ViewContent', ...eventData });

    // Usar evento NATIVO do Meta Pixel para otimização automática
    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      const metaPixelData = {
        content_ids: [productData.id],
        content_type: 'product',
        content_name: productData.name,
        content_category: productData.category,
        value: productData.price || 0,
        currency: productData.currency || 'EUR',
        // Adicionar dados aprimorados para melhor match quality
        user_data: {
          client_user_agent: dataLayer?.user_agent,
          fbc: dataLayer?.utms?.fbclid ? `fb.1.${Date.now()}.${dataLayer.utms.fbclid}` : undefined,
          fbp: dataLayer?.client_id ? `fb.1.${Date.now()}.${dataLayer.client_id}` : undefined
        }
      };

      (window as WindowWithTracking).fbq!('track', 'ViewContent', metaPixelData);
    }
  };

  // Tracking de page view - ATUALIZADO para enviar PageView padrão
  const trackPageView = useCallback(() => {
    // Enviar PageView padrão do Meta Pixel para tracking adequado
    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      (window as WindowWithTracking).fbq!('track', 'PageView');
    }

    // Enviar para GA4 se habilitado
    if (enableGA4 && typeof window !== 'undefined' && (window as WindowWithTracking).gtag) {
      (window as WindowWithTracking).gtag!('event', 'page_view');
    }
  }, [enableMetaPixel, enableGA4]);

  // Tracking específico do quiz
  const trackQuizStep = (step: string, data?: QuizStepData) => {
    dataLayerManager.trackQuizStep(step, data);
    trackEvent('quiz_step', { quiz_step: step, quiz_data: data });
  };

  const trackQuizCompleted = (data?: QuizResultData) => {
    dataLayerManager.trackQuizCompleted(data);
    trackEvent('quiz_completed', { quiz_data: data });
  };

  // Tracking de e-commerce - ATUALIZADO para usar eventos NATIVOS
  const trackEcommerce = (
    event: 'add_to_cart' | 'initiate_checkout' | 'purchase',
    ecommerce: EcommerceData,
    eventId?: string
  ) => {
    // Transformar EcommerceData para o formato esperado pelo dataLayerManager
    const transformedEcommerce = {
      currency: ecommerce.currency || 'EUR',
      value: ecommerce.value || 0,
      items: (ecommerce.items || []).map(item => ({
        item_id: item.item_id || item.id || '',
        item_name: item.item_name || item.name || '',
        category: item.category || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      }))
    };

    dataLayerManager.trackEcommerce(event, transformedEcommerce);

    // Enviar para Meta Pixel com eventos NATIVOS (não customizados)
    if (enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      const fbqEvent = event === 'add_to_cart' ? 'AddToCart' :
        event === 'initiate_checkout' ? 'InitiateCheckout' : 'Purchase';

      const metaPixelData = {
        content_ids: ecommerce.items?.map((item: EcommerceItem) => item.item_id || item.id) || [],
        content_type: 'product',
        value: ecommerce.value || 0,
        currency: ecommerce.currency || 'EUR',
        num_items: ecommerce.items?.length || 1,
        // Adicionar dados aprimorados para melhor match quality
        user_data: {
          client_user_agent: dataLayer?.user_agent,
          fbc: dataLayer?.utms?.fbclid ? `fb.1.${Date.now()}.${dataLayer.utms.fbclid}` : undefined,
          fbp: dataLayer?.client_id ? `fb.1.${Date.now()}.${dataLayer.client_id}` : undefined,
          external_id: dataLayer?.fingerprint_id
        }
      };

      // Usar eventos NATIVOS do Meta Pixel para otimização automática
      (window as WindowWithTracking).fbq!('track', fbqEvent, metaPixelData);
    }

    // Enviar para Utmify com dados aprimorados
    if (enableUtmify && typeof window !== 'undefined' && (window as WindowWithTracking).pixelId) {
      if ((window as WindowWithTracking).utmify?.track) {
        const utmifyData = {
          ...ecommerce,
          enhanced_data: {
            client_id: dataLayer?.client_id,
            fingerprint_id: dataLayer?.fingerprint_id,
            user_agent: dataLayer?.user_agent,
            screen_resolution: dataLayer?.screen_resolution,
            timezone: dataLayer?.timezone,
            language: dataLayer?.language
          }
        };
        (window as WindowWithTracking).utmify!.track(event, utmifyData);
      }
    }
  };

  // Auto-track page view com UTMs quando disponíveis - OTIMIZADO
  useEffect(() => {
    // Aguardar um pouco para garantir que o pixel foi inicializado
    const timeoutId = setTimeout(() => {
      // Enviar PageView apenas uma vez por sessão
      const pageViewSent = sessionStorage.getItem('pageview_sent');
      if (!pageViewSent) {
        trackPageView();
        sessionStorage.setItem('pageview_sent', 'true');
      }

      // Se há UTMs, enviar evento UTMCaptured apenas uma vez
      if (hasUTMs && Object.keys(utmData).length > 0) {
        const utmCapturedSent = sessionStorage.getItem('utm_captured_sent');
        if (!utmCapturedSent && enableMetaPixel && typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
          console.log('Enviando evento UTMCaptured:', utmData);
          (window as WindowWithTracking).fbq!('trackCustom', 'UTMCaptured', utmData);
          sessionStorage.setItem('utm_captured_sent', 'true');
        }
      }
    }, 500); // Aumentar delay para garantir inicialização

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [trackPageView, hasUTMs, utmData, enableMetaPixel]);

  const contextValue: UTMContextType = {
    utmData,
    dataLayer,
    hasUTMs,
    clearUTMData,
    updateUTMData,
    trackEvent,
    trackPageView,
    trackQuizStep,
    trackQuizCompleted,
    trackEcommerce,
    // Novas funções específicas
    trackQuizPageView,
    trackQuizVSLViewed,
    trackQuizStarted,
    trackQuizQuestion,
    trackQuizResultViewed,
    trackQuizRedirectToStore,
    trackQuizRedirectToStoreSuccessful,
    trackStoreProductViewed
  };

  return (
    <UTMContext.Provider value={contextValue}>
      {children}
    </UTMContext.Provider>
  );
};

// Hook para usar o contexto
export const useUTM = (): UTMContextType => {
  const context = useContext(UTMContext);
  if (context === undefined) {
    throw new Error('useUTM deve ser usado dentro de um UTMProvider');
  }
  return context;
};

// Hook para tracking simplificado (sem necessidade de contexto completo)
export const useTracking = () => {
  const context = useContext(UTMContext);

  // Se não há contexto, retornar funções vazias como fallback
  if (!context) {
    return {
      trackEvent: () => { },
      trackPageView: () => { },
      trackQuizStep: () => { },
      trackQuizCompleted: () => { },
      trackEcommerce: () => { },
      // Novas funções específicas
      trackQuizPageView: () => { },
      trackQuizVSLViewed: () => { },
      trackQuizStarted: () => { },
      trackQuizQuestion: () => { },
      trackQuizResultViewed: () => { },
      trackQuizRedirectToStore: () => { },
      trackQuizRedirectToStoreSuccessful: () => { },
      trackStoreProductViewed: () => { }
    };
  }

  return {
    trackEvent: context.trackEvent,
    trackPageView: context.trackPageView,
    trackQuizStep: context.trackQuizStep,
    trackQuizCompleted: context.trackQuizCompleted,
    trackEcommerce: context.trackEcommerce,
    // Novas funções específicas
    trackQuizPageView: context.trackQuizPageView,
    trackQuizVSLViewed: context.trackQuizVSLViewed,
    trackQuizStarted: context.trackQuizStarted,
    trackQuizQuestion: context.trackQuizQuestion,
    trackQuizResultViewed: context.trackQuizResultViewed,
    trackQuizRedirectToStore: context.trackQuizRedirectToStore,
    trackQuizRedirectToStoreSuccessful: context.trackQuizRedirectToStoreSuccessful,
    trackStoreProductViewed: context.trackStoreProductViewed
  };
};