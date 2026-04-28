import { UTMData, DataLayer } from '@/hooks/useUTMCapture';

// Definir tipos para window com tracking
interface WindowWithTracking extends Window {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  pixelId?: string;
  utmify?: {
    track: (event: string, data: Record<string, unknown>) => void;
  };
  dataLayer?: Array<Record<string, unknown>>;
}

// Definir tipos para dados de produto
interface ProductData {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
  brand?: string;
  variant?: string;
  quantity?: number;
}

// Definir tipos para dados de quiz
interface QuizResultData {
  quiz_id?: string;
  result_type?: string;
  score?: number;
  recommendations?: string[];
  completion_time?: number;
  answers?: Record<string, unknown>;
}

// Definir tipos para dados de tracking genéricos
interface TrackingData {
  [key: string]: string | number | boolean | null | undefined | string[] | number[];
}

export interface QuizEvent {
  event: 'quiz_step' | 'quiz_completed';
  quiz_step?: string;
  quiz_data?: TrackingData;
  timestamp: number;
}

export interface EcommerceEvent {
  event: 'add_to_cart' | 'initiate_checkout' | 'purchase';
  ecommerce: {
    currency: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
  };
  timestamp: number;
}

export type DataLayerEvent = QuizEvent | EcommerceEvent;

export class DataLayerManager {
  private static instance: DataLayerManager;
  private dataLayer: Array<DataLayerEvent | DataLayer> = [];
  private utmData: UTMData = {};

  private constructor() {
    // Inicializar data layer global se não existir
    if (typeof window !== 'undefined') {
      (window as WindowWithTracking).dataLayer = (window as WindowWithTracking).dataLayer || [];
      this.dataLayer = (window as WindowWithTracking).dataLayer as unknown as Array<DataLayerEvent | DataLayer>;
    }
  }

  public static getInstance(): DataLayerManager {
    if (!DataLayerManager.instance) {
      DataLayerManager.instance = new DataLayerManager();
    }
    return DataLayerManager.instance;
  }

  // Definir dados UTM globais
  public setUTMData(utmData: UTMData): void {
    this.utmData = utmData;
    this.push({
      event: 'utm_data_updated',
      utm_data: utmData,
      timestamp: Date.now()
    } as Record<string, unknown>);
  }

  // Adicionar evento ao data layer
  public push(event: DataLayerEvent | DataLayer | Record<string, unknown>): void {
    // Adicionar UTMs a todos os eventos se disponíveis
    const enrichedEvent = {
      ...event,
      utm_data: this.utmData,
      session_timestamp: Date.now()
    } as unknown as DataLayerEvent | DataLayer;

    this.dataLayer.push(enrichedEvent);

    // Também enviar para window.dataLayer se disponível
    if (typeof window !== 'undefined' && (window as WindowWithTracking).dataLayer) {
      (window as WindowWithTracking).dataLayer!.push(enrichedEvent as unknown as Record<string, unknown>);
    }

    // Auto-enviar para integrações se configurado
    if (typeof window !== 'undefined') {
      // Enviar para GA4 se disponível
      if ((window as WindowWithTracking).gtag) {
        this.sendToGA4('G-XXXXXXXXXX'); // Substituir pelo ID real
      }
      
      // Removido auto-envio para Meta Pixel para evitar duplicação
      // O UTMContext já gerencia o envio do UTMCaptured
      
      // Enviar para Utmify se disponível
      if ((window as WindowWithTracking).utmify) {
        this.sendToUtmify();
      }
    }

    // Log para debug (remover em produção)
    console.log('DataLayer Event:', enrichedEvent);
  }



  public trackQuizStep(step: string, data?: TrackingData): void {
    this.push({
      event: 'quiz_step',
      quiz_step: step,
      quiz_data: data,
      timestamp: Date.now()
    });
  }

  public trackQuizCompleted(data?: TrackingData): void {
    this.push({
      event: 'quiz_completed',
      quiz_data: data,
      timestamp: Date.now()
    });
  }

  public trackEcommerce(
    event: 'add_to_cart' | 'initiate_checkout' | 'purchase',
    ecommerce: EcommerceEvent['ecommerce']
  ): void {
    this.push({
      event,
      ecommerce,
      timestamp: Date.now()
    });
  }

  // Novas funções específicas para eventos customizados do Quiz
  public trackPageView(title: string, location: string, path: string): void {
    // Removido o push para dataLayer com page_view
    // Mantendo apenas a estrutura para compatibilidade
    console.log('Page view tracked:', { title, location, path });
  }

  public trackQuizPageView(): void {
    this.push({
      event: 'Quiz_PageView',
      timestamp: Date.now()
    });
  }

  public trackQuizVSLViewed(): void {
    this.push({
      event: 'Quiz_VSLViewed',
      timestamp: Date.now()
    });
  }

  public trackQuizStarted(): void {
    this.push({
      event: 'Quiz_Started',
      timestamp: Date.now()
    });
  }

  public trackQuizQuestion(questionNumber: number, answer?: string): void {
    this.push({
      event: `Quiz_Question${questionNumber}`,
      question_number: questionNumber,
      answer: answer,
      timestamp: Date.now()
    });
  }

  public trackQuizResultViewed(result?: QuizResultData): void {
    this.push({
      event: 'Quiz_ResultViewed',
      result_data: result,
      timestamp: Date.now()
    });
  }

  public trackQuizRedirectToStore(): void {
    this.push({
      event: 'Quiz_RedirectToStore',
      timestamp: Date.now()
    });
  }

  public trackQuizRedirectToStoreSuccessful(): void {
    this.push({
      event: 'Quiz_RedirectToStoreSucessful',
      timestamp: Date.now()
    });
  }

  // Nova função para evento nativo da Store
  public trackStoreProductViewed(productData: ProductData): void {
    this.push({
      event: 'ViewContent',
      content_type: 'product',
      content_ids: [productData.id],
      content_name: productData.name,
      value: productData.price,
      currency: productData.currency || 'EUR',
      ...productData,
      timestamp: Date.now()
    });
  }

  // Obter todos os eventos do data layer
  public getDataLayer(): Array<DataLayerEvent | DataLayer | Record<string, unknown>> {
    return [...this.dataLayer];
  }

  // Obter eventos filtrados por tipo
  public getEventsByType(eventType: string): Array<DataLayerEvent | DataLayer | Record<string, unknown>> {
    return this.dataLayer.filter((item: DataLayerEvent | DataLayer | Record<string, unknown>) => 
      'event' in item && item.event === eventType
    );
  }

  // Limpar data layer
  public clear(): void {
    this.dataLayer.length = 0;
    if (typeof window !== 'undefined' && (window as WindowWithTracking).dataLayer) {
      (window as WindowWithTracking).dataLayer!.length = 0;
    }
  }

  // Exportar dados para análise
  public exportData(): string {
    return JSON.stringify({
      utm_data: this.utmData,
      events: this.dataLayer,
      exported_at: new Date().toISOString()
    }, null, 2);
  }

  // Integração com Google Analytics 4
  public sendToGA4(measurementId: string): void {
    if (typeof window !== 'undefined' && (window as WindowWithTracking).gtag) {
      // Configurar GA4 com UTMs
      (window as WindowWithTracking).gtag!('config', measurementId, {
        custom_map: {
          utm_source: 'utm_source',
          utm_medium: 'utm_medium',
          utm_campaign: 'utm_campaign',
          utm_content: 'utm_content',
          utm_term: 'utm_term'
        }
      });

      // Enviar UTMs como parâmetros customizados
      if (Object.keys(this.utmData).length > 0) {
        (window as WindowWithTracking).gtag!('event', 'utm_captured', this.utmData);
      }
    }
  }

  // Integração com Meta Pixel
  public sendToMetaPixel(): void {
    if (typeof window !== 'undefined' && (window as WindowWithTracking).fbq) {
      // Enviar UTMs como parâmetros customizados
      if (Object.keys(this.utmData).length > 0) {
        (window as WindowWithTracking).fbq!('trackCustom', 'UTMCaptured', this.utmData);
      }
    }
  }

  // Integração com Utmify
  public sendToUtmify(): void {
    if (typeof window !== 'undefined' && (window as WindowWithTracking).pixelId) {
      // Utmify já captura automaticamente, mas podemos enviar eventos customizados
      // Enviar para Utmify se a função estiver disponível
      if ((window as WindowWithTracking).utmify?.track) {
        (window as WindowWithTracking).utmify!.track('custom_utm_capture', this.utmData);
      }
    }
  }
}

// Instância singleton para uso global
export const dataLayerManager = DataLayerManager.getInstance();

// Funções de conveniência para uso direto
export const trackPageView = (title: string, location: string, path: string) => {
  dataLayerManager.trackPageView(title, location, path);
};

export const trackQuizStep = (step: string, data?: TrackingData) => {
  dataLayerManager.trackQuizStep(step, data);
};

export const trackQuizCompleted = (data?: TrackingData) => {
  dataLayerManager.trackQuizCompleted(data);
};

export const trackEcommerce = (
  event: 'add_to_cart' | 'initiate_checkout' | 'purchase',
  ecommerce: EcommerceEvent['ecommerce']
) => {
  dataLayerManager.trackEcommerce(event, ecommerce);
};