// Device Fingerprint and Advanced Data Collection Utilities
// Para melhorar match quality e correspondência de dados nos pixels

export interface DeviceData {
  // Screen & Display
  screen_width: number;
  screen_height: number;
  screen_color_depth: number;
  screen_pixel_ratio: number;
  viewport_width: number;
  viewport_height: number;
  
  // Browser & System
  browser_language: string;
  browser_languages: string[];
  timezone: string;
  timezone_offset: number;
  platform: string;
  
  // Network & Performance
  connection_type?: string;
  connection_downlink?: number;
  connection_effective_type?: string;
  
  // Hardware (quando disponível)
  device_memory?: number;
  hardware_concurrency: number;
  
  // Cookies & Storage
  cookies_enabled: boolean;
  local_storage_enabled: boolean;
  session_storage_enabled: boolean;
  
  // Additional identifiers
  canvas_fingerprint?: string;
  webgl_fingerprint?: string;
}

export interface EnhancedUserData {
  // Dados básicos já coletados
  user_agent: string;
  referrer: string;
  page_url: string;
  
  // Novos dados do dispositivo
  device_data: DeviceData;
  
  // Dados de comportamento
  session_duration?: number;
  page_load_time?: number;
  scroll_depth?: number;
  
  // Identificadores únicos
  client_id?: string;
  fingerprint_id?: string;
}

class DeviceFingerprint {
  private static instance: DeviceFingerprint;
  private deviceData: DeviceData | null = null;
  private startTime: number = Date.now();

  public static getInstance(): DeviceFingerprint {
    if (!DeviceFingerprint.instance) {
      DeviceFingerprint.instance = new DeviceFingerprint();
    }
    return DeviceFingerprint.instance;
  }

  // Coletar dados básicos do dispositivo
  public collectDeviceData(): DeviceData {
    if (typeof window === 'undefined') {
      return this.getDefaultDeviceData();
    }

    // Tipagem específica para propriedades do navigator que podem não estar disponíveis
    const nav = navigator as Navigator & {
      connection?: {
        type?: string;
        downlink?: number;
        effectiveType?: string;
      };
      deviceMemory?: number;
    };
    const screen = window.screen;
    
    this.deviceData = {
      // Screen & Display
      screen_width: screen.width,
      screen_height: screen.height,
      screen_color_depth: screen.colorDepth,
      screen_pixel_ratio: window.devicePixelRatio || 1,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      
      // Browser & System
      browser_language: navigator.language,
      browser_languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset: new Date().getTimezoneOffset(),
      platform: navigator.platform,
      
      // Network & Performance (quando disponível)
      connection_type: nav.connection?.type,
      connection_downlink: nav.connection?.downlink,
      connection_effective_type: nav.connection?.effectiveType,
      
      // Hardware
      device_memory: nav.deviceMemory,
      hardware_concurrency: navigator.hardwareConcurrency || 1,
      
      // Storage capabilities
      cookies_enabled: navigator.cookieEnabled,
      local_storage_enabled: this.isStorageAvailable('localStorage'),
      session_storage_enabled: this.isStorageAvailable('sessionStorage'),
      
      // Fingerprints (básicos)
      canvas_fingerprint: this.generateCanvasFingerprint(),
      webgl_fingerprint: this.generateWebGLFingerprint()
    };

    return this.deviceData;
  }

  // Verificar se storage está disponível
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Gerar fingerprint básico do canvas
  private generateCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint canvas', 2, 2);
      
      return canvas.toDataURL().slice(-50); // Últimos 50 caracteres
    } catch {
      return '';
    }
  }

  // Gerar fingerprint básico do WebGL
  private generateWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';
      
      // Type casting para WebGLRenderingContext
      const webglContext = gl as WebGLRenderingContext;
      const renderer = webglContext.getParameter(webglContext.RENDERER);
      const vendor = webglContext.getParameter(webglContext.VENDOR);
      
      return btoa(`${renderer}-${vendor}`).slice(-20);
    } catch {
      return '';
    }
  }

  // Dados padrão para SSR
  private getDefaultDeviceData(): DeviceData {
    return {
      screen_width: 0,
      screen_height: 0,
      screen_color_depth: 24,
      screen_pixel_ratio: 1,
      viewport_width: 0,
      viewport_height: 0,
      browser_language: 'en-US',
      browser_languages: ['en-US'],
      timezone: 'UTC',
      timezone_offset: 0,
      platform: 'unknown',
      hardware_concurrency: 1,
      cookies_enabled: true,
      local_storage_enabled: false,
      session_storage_enabled: false
    };
  }

  // Coletar dados de comportamento
  public collectBehaviorData(): Partial<EnhancedUserData> {
    if (typeof window === 'undefined') return {};

    return {
      session_duration: Date.now() - this.startTime,
      page_load_time: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
      scroll_depth: this.calculateScrollDepth()
    };
  }

  // Calcular profundidade do scroll
  private calculateScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const windowHeight = window.innerHeight;
    
    return Math.round((scrollTop / (documentHeight - windowHeight)) * 100) || 0;
  }

  // Gerar ID único do cliente
  public generateClientId(): string {
    // Tentar recuperar do localStorage primeiro
    if (typeof window !== 'undefined' && this.isStorageAvailable('localStorage')) {
      let clientId = localStorage.getItem('client_id');
      if (!clientId) {
        clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('client_id', clientId);
      }
      return clientId;
    }
    
    // Fallback para sessão
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Gerar fingerprint único do dispositivo
  public generateFingerprintId(): string {
    const deviceData = this.deviceData || this.collectDeviceData();
    
    const fingerprintString = [
      deviceData.screen_width,
      deviceData.screen_height,
      deviceData.screen_color_depth,
      deviceData.browser_language,
      deviceData.timezone,
      deviceData.platform,
      deviceData.hardware_concurrency,
      deviceData.canvas_fingerprint,
      deviceData.webgl_fingerprint
    ].join('|');
    
    // Simples hash (para produção, usar biblioteca de hash mais robusta)
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash).toString(36)}`;
  }

  // Coletar todos os dados aprimorados
  public collectEnhancedUserData(): EnhancedUserData {
    const deviceData = this.collectDeviceData();
    const behaviorData = this.collectBehaviorData();
    
    return {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_data: deviceData,
      client_id: this.generateClientId(),
      fingerprint_id: this.generateFingerprintId(),
      ...behaviorData
    };
  }
}

// Instância singleton
export const deviceFingerprint = DeviceFingerprint.getInstance();

// Hook para React
export const useDeviceFingerprint = () => {
  return {
    collectDeviceData: () => deviceFingerprint.collectDeviceData(),
    collectEnhancedUserData: () => deviceFingerprint.collectEnhancedUserData(),
    generateClientId: () => deviceFingerprint.generateClientId(),
    generateFingerprintId: () => deviceFingerprint.generateFingerprintId()
  };
};