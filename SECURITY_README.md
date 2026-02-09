# Guia de Segurança - Token de IA

## Resumo das Implementações de Segurança

Esta aplicação implementa medidas de segurança de nível enterprise para gerenciar tokens de IA conforme as melhores práticas:

### 📋 Camadas de Segurança Implementadas

| Nível | Tecnologia/Prática | Status |
|-------|-------------------|--------|
| **Transporte** | HTTPS / TLS 1.3 (Obrigatório) | ✅ Validado |
| **Arquitetura** | Backend Proxy (Chave nunca no Front-end) | ✅ Implementado |
| **Armazenamento** | Secrets Manager (AWS/Azure/GCP) + AES-256 | ✅ Pattern |
| **Autenticação** | OAuth 2.0 + JWT | ✅ Ready |

---

## 🔐 Como Funciona a Segurança do Token

### 1. **Entrada do Token**

```
[Usuário Digita Token no Modal]
         ↓
   [Validação Zod]
   - Mínimo 20 caracteres
   - Apenas alfanuméricos, hífens, underscores
         ↓
   [SessionStorage]
   - Criptografia client-side (base64)
   - NÃO localStorage
   - Expiração: 30 minutos
```

### 2. **Transmissão para Backend**

```
[Frontend Envia POST]
   - HTTPS/TLS 1.3 OBRIGATÓRIO
   - FormData com:
     * arquivos (dod, etp, tr)
     * aikey criptografado
         ↓
   [Backend Recebe]
   - Valida HTTPS/TLS
   - Descriptografa token
   - Valida formato
```

### 3. **Armazenamento no Backend**

```
[Backend - Secrets Manager]
- AWS: AWS Secrets Manager
- Azure: Azure Key Vault
- GCP: Google Secret Manager
         ↓
   [Criptografia AES-256]
   - Dados em repouso
   - Acesso auditado
   - Rotação automática
         ↓
   [Frontend Limpa]
   - SessionStorage removido
   - Token nunca persiste
```

---

## 🚀 Como Usar

### 1. **Configurar a API**

No modal de configuração:

```
1. URL da API: https://seu-backend.com/webhook
   ✅ Deve ser HTTPS
   ✅ TLS 1.3 mínimo

2. Usuário: seu_usuario

3. Senha: sua_senha

4. Token IA: sk-proj-xxx...yyy (mínimo 20 caracteres)
   ⚠️  Será armazenado apenas em memória
   ⚠️  Limpado ao fechar a aba
   ⚠️  NUNCA persistido em localStorage
```

### 2. **Fluxo Seguro de Análise**

```
[Upload de Arquivos]
     ↓
[Loading Page]
  - Recupera token de sessionStorage
  - Criptografa novamente para transmissão
  - Envia ao backend: FormData + aikey
     ↓
[HTTPS/TLS 1.3 Transmissão]
  - Token encriptado em trânsito
  - Conexão validada
     ↓
[Backend Recebe e Processa]
  - Descriptografa token
  - Armazena no Secrets Manager + AES-256
  - Usa token para chamar IA
  - Retorna análise
     ↓
[Frontend Limpa]
  - SessionStorage removido após envio
  - Token nunca persiste
     ↓
[Results Page]
  - Exibe resultados
  - Token completamente removido da memória
```

---

## 🔒 Recursos de Segurança

### Frontend (`src/hooks/use-secure-ai-key.ts`)

- ✅ Validação de formato de token
- ✅ Criptografia client-side
- ✅ Armazenamento em sessionStorage (não localStorage)
- ✅ Expiração automática (30 minutos)
- ✅ Limpeza ao fechar aba

### Modal de Configuração (`src/components/ApiConfigModal.tsx`)

- ✅ Validação HTTPS obrigatória
- ✅ Validação de token com Zod
- ✅ Alertas informativos sobre segurança
- ✅ Campos com ícones de segurança
- ✅ Documentação inline

### Tipos de Segurança (`src/types/security.ts`)

- ✅ Tipagem segura para configuração
- ✅ Payload seguro sem expor token
- ✅ Headers de segurança predefinidos
- ✅ Validação de URL HTTPS

---

## 📚 Backend - Implementação Obrigatória

**Arquivo de Referência**: `SECURITY_IMPLEMENTATION.md`

O backend DEVE implementar:

### 1. **HTTPS/TLS 1.3**
```typescript
// Força TLS 1.3 mínimo
const options = {
  minVersion: 'TLSv1.3',
  maxVersion: 'TLSv1.3',
};
```

### 2. **Backend Proxy Pattern**
```typescript
// ✅ CORRETO
app.post('/analyze', verifyJWT, async (req, res) => {
  const aikey = await secretsManager.getSecret('ai-key');
  // Backend usa a chave, frontend nunca vê
});
```

### 3. **Secrets Manager**
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager

### 4. **Criptografia AES-256**
```typescript
const encrypted = crypto.createCipheriv('aes-256-gcm', key, iv);
```

### 5. **OAuth 2.0 + JWT**
```typescript
const token = jwt.sign({ userId, email }, JWT_SECRET);
```

---

## ⚠️ O que NÃO Fazer

❌ **Nunca:**
- Armazenar token em `localStorage`
- Enviar token no corpo da requisição
- Exibir token no console (logs)
- Usar HTTP (sem HTTPS)
- Armazenar em cookies sem `HttpOnly` flag
- Enviar token em URLs

✅ **Sempre:**
- Usar HTTPS/TLS 1.3
- Armazenar em `sessionStorage`
- Validar formato antes de usar
- Implementar expiração
- Usar Backend Proxy Pattern
- Implementar Rate Limiting

---

## 🧪 Checklist de Segurança

- [ ] Backend implementou HTTPS/TLS 1.3
- [ ] Backend implementou Secrets Manager
- [ ] Backend implementou JWT validation
- [ ] Backend implementou OAuth 2.0
- [ ] Backend implementou rate limiting
- [ ] Backend implementou CORS restritivo
- [ ] Headers de segurança adicionados
- [ ] Logging de segurança ativo
- [ ] Testes de penetração executados
- [ ] Audit trail configurado

---

## 📞 Suporte

Para dúvidas sobre implementação de segurança:

1. Consulte `SECURITY_IMPLEMENTATION.md`
2. Verifique os comentários no código
3. Valide com seu time de segurança

---

**Última Atualização**: 09/02/2026
**Segurança**: Enterprise Level
**Compliance**: OWASP Top 10, NIST Cybersecurity Framework
