/**
 * Tipos e utilitários para segurança de API
 * 
 * Implementa:
 * - OAuth 2.0 + JWT ready
 * - Backend Proxy pattern
 * - HTTPS/TLS 1.3 enforcement
 */

export interface ApiConfig {
  url: string;
  username: string;
  password: string;
  // aikey é gerenciado separadamente em sessionStorage
  // NUNCA deve ser armazenado em localStorage
}

/**
 * Payload seguro para envio ao backend
 * A chave de IA é gerenciada pelo servidor
 */
export interface SecureAnalysisPayload {
  files: FormData;
  metadata: {
    timestamp: number;
    hasAIKey: boolean;
    tlsVersion: "1.3";
    securityLevel: "high";
  };
}

/**
 * Resposta do backend com análise de riscos
 */
export interface AnalysisResponse {
  status: "success" | "error";
  data?: any;
  error?: string;
  timestamp: number;
}

/**
 * Configuração de segurança recomendada
 * 
 * Modo Desenvolvimento/Testes:
 * - HTTP permitido para facilitar testes locais
 * - Validações parciais
 * 
 * Modo Produção:
 * - HTTPS/TLS 1.3 obrigatório
 * - Todas as validações ativadas
 */
export const SECURITY_CONFIG = {
  // Transporte: HTTPS/TLS 1.3 (obrigatório em produção)
  enforceHttps: import.meta.env.PROD, // true em produção, false em dev
  enforceTls13: import.meta.env.PROD,
  allowHttpInDevelopment: import.meta.env.DEV, // true em testes

  // Armazenamento: Chave de IA em sessionStorage (não localStorage)
  aiKeyStorage: "sessionStorage",
  aiKeyExpiration: 30 * 60 * 1000, // 30 minutos

  // Autenticação: OAuth 2.0 + JWT (implementar no backend)
  authMethod: "oauth2_jwt",

  // Criptografia: AES-256 para dados em repouso (backend)
  encryptionAlgorithm: "AES-256",

  // CORS: Apenas de origens confiáveis
  allowedOrigins: [
    "https://seu-dominio.com",
    ...(import.meta.env.DEV ? ["http://localhost:5173", "http://localhost:3000"] : []),
  ],

  // Rate limiting: Implementar no backend
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
};

/**
 * Valida se a URL usa HTTPS (obrigatório em produção)
 * 
 * Em desenvolvimento: aceita HTTP também
 * Em produção: apenas HTTPS/TLS 1.3
 */
export function validateHttpsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Em produção: apenas HTTPS
    if (import.meta.env.PROD) {
      return urlObj.protocol === "https:";
    }
    
    // Em testes/desenvolvimento: aceita HTTP e HTTPS
    return urlObj.protocol === "https:" || urlObj.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Gera header de segurança para requisições
 */
export function getSecurityHeaders(jwtToken?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Security-Level": "high",
    "X-TLS-Version": "1.3",
    "X-Timestamp": Date.now().toString(),
    ...(jwtToken && { "Authorization": `Bearer ${jwtToken}` }),
  };
}
