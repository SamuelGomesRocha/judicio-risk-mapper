# 🧪 Testes - HTTP Opcional (Desenvolvimento)

## 🔄 O que Mudou

A validação de HTTPS foi modificada para permitir **HTTP em testes/desenvolvimento** enquanto mantém **HTTPS obrigatório em produção**.

---

## 📋 Comportamento por Ambiente

### 🔧 Desenvolvimento (`import.meta.env.DEV`)
```
✅ HTTP: Permitido
✅ HTTPS: Permitido
✅ Sem validação rigorosa
⚠️ Aviso no modal: "(HTTP aceito em testes)"
```

### 🚀 Produção (`import.meta.env.PROD`)
```
❌ HTTP: Rejeitado
✅ HTTPS: Obrigatório (TLS 1.3)
✅ Validação rigorosa
🔒 Sem exceções
```

---

## 🎯 Modificações Técnicas

### 1. **ApiConfigModal.tsx**
```typescript
// Antes: Sempre validava HTTPS
.refine((url) => validateHttpsUrl(url), { ... })

// Depois: Condicional por ambiente
.refine((url) => {
  const isDevelopment = import.meta.env.DEV || !import.meta.env.PROD;
  if (isDevelopment) {
    return url.startsWith('http://') || url.startsWith('https://');
  }
  return validateHttpsUrl(url);
}, { ... })
```

### 2. **security.ts - validateHttpsUrl()**
```typescript
// Antes: Apenas HTTPS
return urlObj.protocol === "https:";

// Depois: Condicional
if (import.meta.env.PROD) {
  return urlObj.protocol === "https:";
}
return urlObj.protocol === "https:" || urlObj.protocol === "http:";
```

### 3. **security.ts - SECURITY_CONFIG**
```typescript
enforceHttps: import.meta.env.PROD,
allowHttpInDevelopment: import.meta.env.DEV,

// CORS com localhost
allowedOrigins: [
  "https://seu-dominio.com",
  ...(import.meta.env.DEV ? ["http://localhost:5173", "http://localhost:3000"] : []),
]
```

---

## 🧪 Exemplos de Teste

### ✅ Válidas em Desenvolvimento

```
http://localhost:3000/webhook
http://localhost:5173/webhook
http://192.168.1.100:8000/webhook
https://staging.seu-dominio.com/webhook
```

### ❌ Inválidas em Produção

```
http://seu-dominio.com/webhook     ❌ HTTP
http://localhost:3000/webhook      ❌ Desenvolvimento
ftp://seu-dominio.com/webhook      ❌ Protocolo inválido
```

### ✅ Válidas em Produção

```
https://seu-dominio.com/webhook
https://api.seu-dominio.com/webhook
https://seu-dominio.com:443/webhook
```

---

## 🔐 Segurança Mantida

Mesmo aceitando HTTP em testes, a segurança é mantida:

- ✅ Token continua criptografado
- ✅ SessionStorage gerenciado
- ✅ Expiração de 30 minutos
- ✅ Validação de formato
- ✅ Alertas informativos

---

## 📝 Avisos no Modal

### Desenvolvimento
```
HTTPS/TLS 1.3 obrigatório para transmissão ao backend (HTTP aceito em testes)
```

### Produção
```
HTTPS/TLS 1.3 obrigatório para transmissão ao backend
```

---

## 🚀 Como Usar em Testes

### Teste Local com HTTP

```
Configurar a API:
├─ URL: http://localhost:3000/webhook
├─ Usuário: usuario_teste
├─ Senha: senha_teste
└─ Token IA: sk-proj-teste123456789
```

### Teste com HTTPS (Recomendado)

```
Configurar a API:
├─ URL: https://seu-backend.local/webhook
├─ Usuário: usuario_teste
├─ Senha: senha_teste
└─ Token IA: sk-proj-teste123456789
```

---

## ⚙️ Variáveis de Ambiente (Vite)

O comportamento é controlado automaticamente pelo Vite:

```env
# Desenvolvimento (npm run dev)
import.meta.env.DEV = true
import.meta.env.PROD = false

# Produção (npm run build)
import.meta.env.DEV = false
import.meta.env.PROD = true
```

---

## 🔍 Verificação em Tempo Real

Para saber em qual modo você está:

```typescript
console.log("Desenvolvimento?", import.meta.env.DEV);
console.log("Produção?", import.meta.env.PROD);
console.log("HTTP permitido?", import.meta.env.DEV);
```

---

## 📋 Checklist de Segurança

- [x] HTTP aceitável em testes
- [x] HTTPS obrigatório em produção
- [x] Modal avisa sobre o modo
- [x] Configuração automática por ambiente
- [x] Sem armazenamento em localStorage
- [x] Token criptografado
- [x] Expiração mantida

---

## ⚠️ Importante para Produção

**Antes de fazer deploy em produção:**

1. Verificar que `import.meta.env.PROD = true`
2. Verificar que `enforceHttps: true`
3. Usar apenas URLs HTTPS
4. Validar certificados SSL/TLS
5. Testar com HTTPS apenas

---

## 📞 Exemplos de Erro

### Erro em Produção com HTTP
```
URL deve usar HTTPS em produção (TLS 1.3 recomendado)
```

### Erro em Desenvolvimento com URL inválida
```
URL inválida
```

---

## 🔗 Arquivos Modificados

- `src/components/ApiConfigModal.tsx` - Validação condicional
- `src/types/security.ts` - Função e config atualizadas

---

**Atualização:** 09/02/2026
**Status:** ✅ Testes com HTTP permitido, Produção com HTTPS obrigatório
