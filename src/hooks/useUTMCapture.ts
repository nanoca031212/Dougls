'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { deviceFingerprint } from '../utils/deviceFingerprint';

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  // Parâmetros customizados
  [key: string]: string | undefined;
}

export interface DataLayer {
  utms: UTMData;
  page_title: string;
  page_location: string;
  page_path: string;
  timestamp: number;
  page_url: string;
  referrer: string;
  user_agent: string;
  session_id: string;
  // Dados aprimorados do dispositivo
  client_id: string;
  fingerprint_id: string;
  screen_resolution: string;
  viewport_size: string;
  timezone: string;
  language: string;
  platform: string;
  device_memory?: number;
  connection_type?: string;
  cookies_enabled: boolean;
}

export const useUTMCapture = () => {
  const searchParams = useSearchParams();
  const [utmData, setUtmData] = useState<UTMData>({});
  const [dataLayer, setDataLayer] = useState<DataLayer | null>(null);

  // Gerar session ID único
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Capturar todos os parâmetros UTM e de tracking
  const captureUTMs = useCallback(() => {
    const utms: UTMData = {};
    
    // UTMs padrão
    const utmParams = [
      'utm_source',
      'utm_medium', 
      'utm_campaign',
      'utm_content',
      'utm_term'
    ];

    // Click IDs
    const clickIds = [
      'gclid',    // Google
      'fbclid',   // Facebook
      'ttclid',   // TikTok
      'msclkid',  // Microsoft
      'twclid'    // Twitter
    ];

    // Capturar UTMs
    utmParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        utms[param] = value;
      }
    });

    // Capturar Click IDs
    clickIds.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        utms[param] = value;
      }
    });

    // Capturar parâmetros customizados (qualquer parâmetro que comece com utm_ ou contenha clid)
    searchParams.forEach((value, key) => {
      if ((key.startsWith('utm_') || key.includes('clid')) && !utms[key]) {
        utms[key] = value;
      }
    });

    return utms;
  }, [searchParams]);

  // Criar data layer completo
  const createDataLayer = useCallback((utms: UTMData): DataLayer => {
    // Coletar dados avançados do dispositivo apenas no cliente
    let enhancedData;
    let deviceData;
    
    if (typeof window !== 'undefined') {
      try {
        enhancedData = deviceFingerprint.collectEnhancedUserData();
        deviceData = enhancedData.device_data;
      } catch (error) {
        console.warn('Erro ao coletar dados do dispositivo:', error);
        // Fallback para dados básicos
        deviceData = {
          screen_width: window.screen?.width || 0,
          screen_height: window.screen?.height || 0,
          viewport_width: window.innerWidth || 0,
          viewport_height: window.innerHeight || 0,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          browser_language: navigator.language || '',
          platform: navigator.platform || '',
          cookies_enabled: navigator.cookieEnabled || false,
          screen_color_depth: window.screen?.colorDepth || 0,
          screen_pixel_ratio: window.devicePixelRatio || 1,
          browser_languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
          timezone_offset: new Date().getTimezoneOffset(),
          hardware_concurrency: navigator.hardwareConcurrency || 1,
          local_storage_enabled: true,
          session_storage_enabled: true
        };
        enhancedData = {
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page_url: window.location.href,
          device_data: deviceData,
          client_id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fingerprint_id: `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
    } else {
      // Dados padrão para SSR
      deviceData = {
        screen_width: 0,
        screen_height: 0,
        viewport_width: 0,
        viewport_height: 0,
        timezone: '',
        browser_language: '',
        platform: '',
        cookies_enabled: false,
        screen_color_depth: 0,
        screen_pixel_ratio: 1,
        browser_languages: [],
        timezone_offset: 0,
        hardware_concurrency: 1,
        local_storage_enabled: false,
        session_storage_enabled: false
      };
      enhancedData = {
        user_agent: '',
        referrer: '',
        page_url: '',
        device_data: deviceData,
        client_id: '',
        fingerprint_id: ''
      };
    }
    
    return {
      utms,
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: Date.now(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      session_id: generateSessionId(),
      // Dados aprimorados do dispositivo
      client_id: enhancedData.client_id || '',
      fingerprint_id: enhancedData.fingerprint_id || '',
      screen_resolution: `${deviceData.screen_width}x${deviceData.screen_height}`,
      viewport_size: `${deviceData.viewport_width}x${deviceData.viewport_height}`,
      timezone: deviceData.timezone,
      language: deviceData.browser_language,
      platform: deviceData.platform,
      device_memory: deviceData.device_memory,
      connection_type: deviceData.connection_type,
      cookies_enabled: deviceData.cookies_enabled
    };
  }, []);

  // Salvar no localStorage para persistência
  const saveToStorage = (data: DataLayer) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('utm_data_layer', JSON.stringify(data));
        localStorage.setItem('utm_data_layer_timestamp', data.timestamp.toString());
      } catch (error) {
        console.warn('Erro ao salvar UTMs no localStorage:', error);
      }
    }
  };

  // Carregar do localStorage
  const loadFromStorage = (): DataLayer | null => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('utm_data_layer');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Erro ao carregar UTMs do localStorage:', error);
      }
    }
    return null;
  };

  // Verificar se os dados são recentes (últimas 24h)
  const isDataFresh = (timestamp: number): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < twentyFourHours;
  };

  useEffect(() => {
    // Capturar UTMs da URL atual
    const currentUTMs = captureUTMs();
    
    // Verificar se há UTMs na URL atual
    const hasCurrentUTMs = Object.keys(currentUTMs).length > 0;
    
    if (hasCurrentUTMs) {
      // Se há UTMs na URL, usar eles e criar novo data layer
      setUtmData(currentUTMs);
      const newDataLayer = createDataLayer(currentUTMs);
      setDataLayer(newDataLayer);
      saveToStorage(newDataLayer);
    } else {
      // Se não há UTMs na URL, tentar carregar do storage
      const storedData = loadFromStorage();
      if (storedData && isDataFresh(storedData.timestamp)) {
        setUtmData(storedData.utms);
        setDataLayer(storedData);
      }
    }
  }, [searchParams, captureUTMs, createDataLayer]);

  // Função para limpar dados
  const clearUTMData = () => {
    setUtmData({});
    setDataLayer(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('utm_data_layer');
      localStorage.removeItem('utm_data_layer_timestamp');
    }
  };

  // Função para atualizar dados manualmente
  const updateUTMData = (newData: Partial<UTMData>) => {
    const updatedUTMs = { ...utmData, ...newData };
    setUtmData(updatedUTMs);
    const updatedDataLayer = createDataLayer(updatedUTMs);
    setDataLayer(updatedDataLayer);
    saveToStorage(updatedDataLayer);
  };

  return {
    utmData,
    dataLayer,
    clearUTMData,
    updateUTMData,
    hasUTMs: Object.keys(utmData).length > 0
  };
};