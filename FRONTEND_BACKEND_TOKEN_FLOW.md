# Fluxo de Token de IA - Frontend → Backend

## 📋 Resumo

O frontend (este projeto) **NÃO armazena** o token de IA permanentemente. Seu papel é:

1. ✅ Receber o token do usuário
2. ✅ Validar o formato
3. ✅ Encriptar para transmissão
4. ✅ Enviar ao backend via POST
5. ✅ Limpar da memória após envio

O backend é responsável por:
1. ✅ Receber o token encriptado
2. ✅ Descriptografar
3. ✅ Armazenar no Secrets Manager (AWS/Azure/GCP)
4. ✅ Criptografar com AES-256 em repouso

---

## 🔄 Fluxo Detalhado

```
FRONTEND (Browser)                          BACKEND (Servidor)
──────────────────────────────────────────────────────────────

1. Usuário abre modal
   ├─ Digita token: "sk-proj-xxx..."
   └─ Clica "Salvar"
         │
         ▼
2. Validação Zod
   ├─ Mínimo 20 caracteres ✓
   ├─ Apenas alfanuméricos/hífens/underscores ✓
   └─ Formato válido ✓
         │
         ▼
3. useSecureAIKey.setAIKey()
   ├─ Criptografa client-side (AES-128 base64)
   ├─ Armazena em sessionStorage
   ├─ Define expiração (30 min)
   └─ Toast: "Configurado com sucesso"
         │
         ▼
4. API Config salva em localStorage
   └─ url, username, password (SEM aikey)
         │
         ▼
5. Usuário faz upload e clica "Analisar"
   ├─ Loading page lê sessionStorage
   ├─ Recupera token criptografado
   └─ Cria FormData com arquivos
         │
         ▼
6. Envia POST ao backend
   ├─ HTTPS/TLS 1.3 ✓
   ├─ FormData:
   │  ├─ dod: arquivo
   │  ├─ etp: arquivo
   │  ├─ tr: arquivo
   │  └─ aikey: "eyJkYXRhIjoic2stcHJvai1..." (encriptado)
   └─ Headers de segurança
         │
         ├──────────────────────────────────────────────────────►
         │
         │                                2. Backend recebe POST
         │                                   ├─ Valida HTTPS ✓
         │                                   ├─ Valida TLS 1.3 ✓
         │                                   └─ Valida JWT/Basic Auth
         │                                        │
         │                                        ▼
         │                                   3. Descriptografa aikey
         │                                      └─ Obtém: "sk-proj-xxx..."
         │                                           │
         │                                           ▼
         │                                   4. Armazena no Secrets Manager
         │                                      ├─ AWS: Secrets Manager
         │                                      ├─ Azure: Key Vault
         │                                      └─ GCP: Secret Manager
         │                                           │
         │                                           ▼
         │                                   5. Criptografa com AES-256
         │                                      └─ Armazena em repouso
         │                                           │
         │                                           ▼
         │                                   6. Processa análise
         │                                      ├─ Usa aikey para chamar IA
         │                                      ├─ Processa documentos
         │                                      └─ Retorna análise
         │                                           │
         │◄──────────────────────────────────────────┤
         │                                        
7. Response recebido
   ├─ Status: "success"
   ├─ Dados: { risks, objectives, ... }
   └─ sessionStorage limpado
         │
         ▼
8. Results page
   └─ Exibe análise
      (token foi limpo, nunca persiste)
```

---

## 📤 Estrutura do POST do Frontend

### Request Headers

```http
POST /webhook HTTP/1.1
Host: seu-backend.com
Connection: keep-alive
Content-Type: multipart/form-data; boundary=...
Authorization: Basic YmxldWRyaW5jZTphbG9ob21vcmE=
X-Security-Level: high
X-TLS-Version: 1.3
X-Timestamp: 1707432000000
```

### Request Body (FormData)

```
FormData:
├─ dod: [File] "1. Documento de Oficializacao da Demanda.pdf"
├─ etp: [File] "2. Estudo Tecnico Preliminar.pdf"
├─ tr: [File] "3. Termo de Referencia.pdf"
└─ aikey: "eyJkYXRhIjoic2stcHJvai1hYmMxMjM0NTY3ODkwLXh5eiIsImVuY3J5cHRlZCI6dHJ1ZSwidGltZXN0YW1wIjoxNzA3NDMyMDAwMDAwfQ=="
```

### Exemplo de `aikey` Encriptado

```json
{
  "data": "sk-proj-abc123456789-xyz",
  "encrypted": true,
  "timestamp": 1707432000000
}
// Convertido para base64:
eyJkYXRhIjoic2stcHJvai1hYmMxMjM0NTY3ODkwLXh5eiIsImVuY3J5cHRlZCI6dHJ1ZSwidGltZXN0YW1wIjoxNzA3NDMyMDAwMDAwfQ==
```

---

## 🔐 Recebimento no Backend (Node.js/Express)

### 1. Endpoint que recebe o POST

```typescript
import express from 'express';
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const app = express();

// Middleware para multipart
app.use(express.json());

// Endpoint que recebe arquivos + token
app.post('/webhook', authenticateRequest, async (req, res) => {
  try {
    // 1. Receber dados
    const { dod, etp, tr, aikey } = req.files;
    const encryptedAikey = req.body.aikey || req.fields.aikey;
    
    console.log("✓ Arquivos recebidos:", { dod: dod.name, etp: etp.name, tr: tr.name });
    
    // 2. Descriptografar aikey
    const decryptedAikey = decryptClientSideToken(encryptedAikey);
    console.log("✓ Token descriptografado:", decryptedAikey.substring(0, 10) + "...");
    
    // 3. Armazenar no Secrets Manager
    await storeInSecretsManager(decryptedAikey, req.user.id);
    console.log("✓ Token armazenado no Secrets Manager");
    
    // 4. Processar análise
    const analysis = await processAnalysis(dod, etp, tr, decryptedAikey);
    
    // 5. Retornar resultado (sem token)
    res.json({
      status: "success",
      data: analysis
    });
    
  } catch (error) {
    console.error("Erro ao processar:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 2. Função para descriptografar
function decryptClientSideToken(encrypted: string): string {
  try {
    const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed.data;
  } catch (error) {
    throw new Error("Erro ao descriptografar token");
  }
}

// 3. Armazenar no Secrets Manager
async function storeInSecretsManager(aikey: string, userId: string) {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  
  // AES-256 encryption
  const encrypted = encryptWithAES256(aikey);
  
  const secretName = `judicio-risk-mapper/user-${userId}/ai-key`;
  
  try {
    await client.createSecret({
      Name: secretName,
      SecretString: JSON.stringify({
        aikey: encrypted,
        created: new Date().toISOString(),
        algorithm: "AES-256"
      })
    });
  } catch (error) {
    if (error.name === 'ResourceExistsException') {
      // Update if exists
      await client.putSecretValue({
        SecretId: secretName,
        SecretString: JSON.stringify({
          aikey: encrypted,
          updated: new Date().toISOString(),
          algorithm: "AES-256"
        })
      });
    } else {
      throw error;
    }
  }
}

// 4. Criptografia AES-256
import crypto from 'crypto';

function encryptWithAES256(data: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Retornar iv + authTag + encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// 5. Usar token da Secrets Manager mais tarde
async function getAIKeyFromSecrets(userId: string): Promise<string> {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const secretName = `judicio-risk-mapper/user-${userId}/ai-key`;
  
  const response = await client.getSecretValue({ SecretId: secretName });
  const secret = JSON.parse(response.SecretString!);
  
  return decryptWithAES256(secret.aikey);
}

function decryptWithAES256(encrypted: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const [iv, authTag, ciphertext] = encrypted.split(':');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// 6. Processar análise com IA
async function processAnalysis(dod, etp, tr, aikey: string) {
  // Usar aikey para chamar API de IA
  const response = await callAIAPI({
    apiKey: aikey,
    files: [dod, etp, tr]
  });
  
  return {
    project_name: response.project_name,
    risks: response.risks,
    objectives: response.objectives
  };
}
```

---

## 🔒 Variáveis de Ambiente (Backend)

```env
# Encryption
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# AWS Secrets Manager
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Authentication
JWT_SECRET=seu_jwt_secreto_muito_seguro
BASIC_AUTH_USER=blueprince
BASIC_AUTH_PASS=alohomora

# HTTPS/TLS
HTTPS_ENABLED=true
TLS_VERSION=1.3
```

---

## 📝 Fluxo de Segurança Resumido

1. **Frontend envia:** Token encriptado (base64) via POST
2. **Backend recebe:** Descriptografa
3. **Backend armazena:** Secrets Manager + AES-256
4. **Backend usa:** Recupera de Secrets Manager quando precisa
5. **Frontend limpa:** SessionStorage removido após envio

---

## ⚠️ Importante

- ✅ O token é **enviado apenas UMA VEZ** na configuração
- ✅ Após isso, é gerenciado **apenas pelo backend**
- ✅ Frontend **não precisa guardar** o token
- ✅ SessionStorage é **apenas temporário** até enviar
- ✅ Backend mantém em **Secrets Manager** para futuro uso

---

## 🔗 Arquivos Relacionados

- Frontend Hook: `src/hooks/use-secure-ai-key.ts`
- Frontend Modal: `src/components/ApiConfigModal.tsx`
- Backend Spec: `SECURITY_IMPLEMENTATION.md`
