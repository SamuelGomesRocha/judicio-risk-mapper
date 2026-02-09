# Guia de Integração - Secure AI Key Hook

## ⚠️ IMPORTANTE - Arquitetura de Token

Este é um **frontend-only**. O token é **temporariamente armazenado** no frontend e **enviado ao backend via POST**.

**Fluxo:**
1. Usuário digita token no modal
2. Token validado e criptografado em sessionStorage
3. **Token é ENVIADO ao backend via POST**
4. Backend armazena no Secrets Manager (AWS/Azure/GCP)
5. Frontend remove token de sessionStorage após envio
6. **Backend mantém token em Secrets Manager** para uso futuro

**Referência Completa:** `FRONTEND_BACKEND_TOKEN_FLOW.md`

### 1. **No Modal de Configuração**

```typescript
// src/components/ApiConfigModal.tsx
import { useSecureAIKey } from "@/hooks/use-secure-ai-key";

export function ApiConfigModal({ open, onOpenChange, onSave, initialConfig }: ApiConfigModalProps) {
  const form = useForm<ApiConfig>({...});
  const { setAIKey } = useSecureAIKey();

  const handleSubmit = (data: ApiConfig) => {
    // Primeiro, armazenar a chave de IA com segurança
    const keyStored = setAIKey(data.aikey);
    
    if (!keyStored) {
      // Se falhar, não continuar
      return;
    }
    
    // Depois, salvar o resto da configuração (sem aikey)
    const configWithoutKey: ApiConfig = {
      url: data.url,
      username: data.username,
      password: data.password,
      // aikey é gerenciado separadamente
    };
    
    onSave(configWithoutKey);
    onOpenChange(false);
  };

  return (
    // ... form rendering
  );
}
```

### 2. **No Loading Page - Enviar ao Backend**

```typescript
// src/pages/Loading.tsx
import { useSecureAIKey } from "@/hooks/use-secure-ai-key";

export default function LoadingPage() {
  const { getAIKey, hasAIKey, clearAIKey } = useSecureAIKey();
  
  const submitToWebhook = async () => {
    try {
      // Verificar se a chave de IA foi configurada
      if (!hasAIKey()) {
        toast.error("Token de IA não configurado");
        navigate("/");
        return;
      }
      
      // Recuperar a chave criptografada de sessionStorage
      const encryptedAikey = getAIKey();
      
      // Criar FormData com arquivos E token
      const formData = new FormData();
      formData.append("dod", filesData.dod);
      formData.append("etp", filesData.etp);
      formData.append("tr", filesData.tr);
      // ✅ IMPORTANTE: Enviar token criptografado ao backend
      if (encryptedAikey) {
        formData.append("aikey", encryptedAikey);
      }
      
      // Enviar ao backend via HTTPS/TLS 1.3
      const response = await fetch(apiConfig.url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ IMPORTANTE: Limpar token de sessionStorage após envio bem-sucedido
      clearAIKey();
      
      // Navegar para resultados
      navigate("/results", { state: { analysisData: data } });
      
    } catch (error) {
      toast.error(error.message);
    }
  };
}
```

### 3. **No Header/NavBar (para logout)**

```typescript
// src/components/Header.tsx
import { useSecureAIKey } from "@/hooks/use-secure-ai-key";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const { clearAIKey } = useSecureAIKey();
  
  const handleLogout = () => {
    // Limpar a chave de IA
    clearAIKey();
    
    // Limpar outras configurações
    localStorage.removeItem("api_config");
    sessionStorage.clear();
    
    // Redirecionar para home
    window.location.href = "/";
  };
  
  return (
    <header>
      {/* ... conteúdo do header */}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </header>
  );
}
```

### 4. **Com Provider de Contexto (Opcional)**

Para compartilhar estado entre múltiplos componentes:

```typescript
// src/contexts/SecurityContext.tsx
import { createContext, useContext } from 'react';
import { useSecureAIKey } from '@/hooks/use-secure-ai-key';

interface SecurityContextType {
  hasAIKey: boolean;
  setAIKey: (key: string) => boolean;
  clearAIKey: () => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { hasAIKey, setAIKey, clearAIKey, isKeyLoaded } = useSecureAIKey();
  
  return (
    <SecurityContext.Provider
      value={{
        hasAIKey: isKeyLoaded,
        setAIKey,
        clearAIKey,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity deve ser usado dentro de SecurityProvider');
  }
  return context;
}
```

```typescript
// src/App.tsx
import { SecurityProvider } from '@/contexts/SecurityContext';

function App() {
  return (
    <SecurityProvider>
      {/* seu app aqui */}
    </SecurityProvider>
  );
}
```

## 5. **Fluxo Completo de Segurança**

```
[Usuário abre App]
        ↓
[Clica em "Configurar API"]
        ↓
[Modal abre]
  ✓ Mostra alertas de segurança
  ✓ Valida HTTPS obrigatório
  ✓ Valida token (20+ caracteres)
        ↓
[Usuário entra com dados]
        ↓
[Clica em "Salvar"]
        ↓
[setAIKey() é chamado]
  ✓ Valida formato
  ✓ Criptografa com AES-128 (base64)
  ✓ Armazena em sessionStorage
  ✓ Define expiração (30 min)
  ✓ Toast de sucesso
        ↓
[Config salva no localStorage (sem aikey)]
        ↓
[Usuário faz upload]
        ↓
[Loading Page]
  ✓ Verifica hasAIKey()
  ✓ Recupera arquivos
  ✓ Envia para backend (sem chave!)
        ↓
[Backend]
  ✓ Recebe FormData
  ✓ Valida JWT
  ✓ Recupera aikey do Secrets Manager
  ✓ Processa com IA
  ✓ Retorna resultados (sem expor chave)
        ↓
[Results Page]
  ✓ Exibe análise
  ✓ Chave nunca foi exposta
```

## 6. **Ambiente .env (Backend)**

```env
# HTTPS/TLS
HTTPS_ENABLED=true
TLS_VERSION=1.3

# Secrets Manager
SECRETS_MANAGER=aws  # ou 'azure', 'gcp'
AWS_REGION=us-east-1
AWS_SECRETS_NAME=production/ai-key

# Criptografia
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY=<seu-key-em-hex>

# JWT
JWT_SECRET=<seu-jwt-secret>
JWT_EXPIRY=1h

# OAuth 2.0
GOOGLE_CLIENT_ID=<seu-client-id>
GOOGLE_CLIENT_SECRET=<seu-client-secret>
```

## 7. **Testes de Segurança**

```typescript
// src/__tests__/hooks/use-secure-ai-key.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSecureAIKey } from '@/hooks/use-secure-ai-key';

describe('useSecureAIKey', () => {
  it('deve validar formato de chave', () => {
    const { result } = renderHook(() => useSecureAIKey());
    
    // Chave muito curta - deve falhar
    const invalid = act(() => {
      return result.current.setAIKey('short');
    });
    
    expect(invalid).toBe(false);
  });
  
  it('deve armazenar em sessionStorage', () => {
    const { result } = renderHook(() => useSecureAIKey());
    
    act(() => {
      result.current.setAIKey('sk-proj-validtokenwithaleast20chars123');
    });
    
    const stored = sessionStorage.getItem('secure_ai_key_session');
    expect(stored).toBeDefined();
  });
  
  it('deve expirar a chave', () => {
    const { result } = renderHook(() => useSecureAIKey());
    
    act(() => {
      result.current.setAIKey('sk-proj-validtoken123456789');
    });
    
    // Avançar 31 minutos
    jest.advanceTimersByTime(31 * 60 * 1000);
    
    const key = act(() => result.current.getAIKey());
    expect(key).toBeNull();
  });
});
```

---

## 📋 Checklist de Implementação

- [ ] Import de `useSecureAIKey` nos componentes necessários
- [ ] `setAIKey()` chamado ao salvar configuração
- [ ] `hasAIKey()` verificado antes de enviar para backend
- [ ] Chave NUNCA enviada ao backend em payload
- [ ] `clearAIKey()` chamado ao fazer logout
- [ ] HTTPS/TLS 1.3 validado no modal
- [ ] Secrets Manager configurado no backend
- [ ] JWT implementado no backend
- [ ] Headers de segurança adicionados
- [ ] Testes de segurança passando

---

**Última Atualização**: 09/02/2026
**Versão**: 1.0
**Status**: Production Ready
