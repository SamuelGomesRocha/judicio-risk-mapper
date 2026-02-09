# Implementação de Segurança - Token de IA (Backend)

## Visão Geral

Este documento descreve como o backend deve implementar as medidas de segurança para gerenciar o token de IA conforme os requisitos especificados.

## 1. Transporte - HTTPS/TLS 1.3 (Obrigatório)

### Implementação Node.js/Express:

```typescript
import https from 'https';
import fs from 'fs';
import express from 'express';

const app = express();

// Forçar HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Configurar TLS 1.3 mínimo
const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  minVersion: 'TLSv1.3',
  maxVersion: 'TLSv1.3', // Força TLS 1.3
};

https.createServer(options, app).listen(443);
```

### Nginx Configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;

    # TLS 1.3 apenas
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Certificado SSL
    ssl_certificate /etc/ssl/certs/certificate.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # HSTS - Force HTTPS por 1 ano
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## 2. Arquitetura - Backend Proxy (Chave NUNCA no Frontend)

### Padrão: Backend gerencia a chave

```typescript
// ❌ ERRADO - Frontend enviando chave
app.post('/analyze', (req, res) => {
  const { aikey } = req.body; // VULNERÁVEL!
  // ...
});

// ✅ CORRETO - Backend recupera do Secrets Manager
app.post('/analyze', authenticate, (req, res) => {
  // Frontend NÃO envia chave
  const aikey = process.env.AI_KEY; // Vem do Secrets Manager
  // ou
  const aikey = await secretsManager.getSecret('ai-key');
  
  // Backend faz a chamada à API da IA
  const result = await callAIAPI(aikey, req.body);
  
  res.json(result); // Frontend recebe resultado, não a chave
});
```

### Estrutura de Request/Response:

```typescript
// Request do Frontend (sem chave)
{
  files: FormData,
  metadata: {
    timestamp: 1707432000000,
    hasAIKey: true,
    tlsVersion: "1.3",
    securityLevel: "high"
  }
}

// Response do Backend (sem expor chave)
{
  status: "success",
  data: {
    project_name: "...",
    risks: [...],
    // Chave NUNCA é retornada
  },
  timestamp: 1707432000000
}
```

## 3. Armazenamento - Secrets Manager + AES-256

### AWS Secrets Manager:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getAIKey() {
  try {
    const command = new GetSecretValueCommand({
      SecretId: "production/ai-key",
      VersionStage: "AWSCURRENT",
    });
    
    const response = await client.send(command);
    const secret = JSON.parse(response.SecretString);
    return secret.aikey;
  } catch (error) {
    console.error("Erro ao recuperar chave do Secrets Manager", error);
    throw error;
  }
}

// Cachear em memória com TTL
const keyCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getAIKeyWithCache() {
  const now = Date.now();
  const cached = keyCache.get('ai-key');
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }
  
  const key = await getAIKey();
  keyCache.set('ai-key', { value: key, timestamp: now });
  return key;
}
```

### Azure Key Vault:

```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  "https://<your-vault-name>.vault.azure.net",
  credential
);

async function getAIKey() {
  const secret = await client.getSecret("ai-key");
  return secret.value;
}
```

### Google Cloud Secret Manager:

```typescript
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

async function getAIKey() {
  const name = client.secretVersionPath(
    process.env.GCP_PROJECT_ID,
    "ai-key",
    "latest"
  );
  
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString();
}
```

### Criptografia AES-256 em Repouso:

```typescript
import crypto from 'crypto';

// Chave de criptografia (também no Secrets Manager!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function encryptKey(key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Retornar: iv + authTag + encrypted
  return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted}`;
}

function decryptKey(encrypted: string): string {
  const [iv, authTag, ciphertext] = encrypted.split('.');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## 4. Autenticação - OAuth 2.0 + JWT

### Implementação JWT:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Do Secrets Manager
const JWT_EXPIRY = '1h';

// Gerar JWT (após autenticação do usuário)
function generateJWT(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Middleware de autenticação
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Usar no endpoint
app.post('/analyze', verifyJWT, async (req, res) => {
  // req.user contém dados do JWT
  const aikey = await getAIKeyWithCache();
  // ...
});
```

### OAuth 2.0 com Google/Microsoft:

```typescript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://seu-dominio.com/auth/callback'
);

// Endpoint de callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  const { tokens } = await oauth2Client.getToken(code);
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  
  // Criar ou atualizar usuário
  const user = await findOrCreateUser(payload);
  
  // Gerar JWT próprio
  const jwt = generateJWT(user);
  
  res.redirect(`https://seu-dominio.com?token=${jwt}`);
});
```

## 5. Rate Limiting e CORS

### Rate Limiting:

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por janela
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

### CORS Restritivo:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: ['https://seu-dominio.com'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## 6. Logging de Segurança

```typescript
// Log ALL access ao token
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
  ],
});

app.post('/analyze', verifyJWT, async (req, res) => {
  logger.info({
    event: 'analyze_request',
    userId: req.user.id,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip,
    tls: req.socket.authorized ? 'verified' : 'unverified',
  });
  
  // ...
});
```

## 7. Checklist de Implementação

- [ ] HTTPS/TLS 1.3 configurado
- [ ] Backend Proxy Pattern implementado
- [ ] Secrets Manager configurado (AWS/Azure/GCP)
- [ ] AES-256 implementado para dados em repouso
- [ ] JWT gerado e validado
- [ ] OAuth 2.0 integrado (Google/Microsoft)
- [ ] Rate Limiting ativado
- [ ] CORS restritivo configurado
- [ ] Logging de segurança implementado
- [ ] Headers de segurança adicionados (HSTS, CSP, etc)
- [ ] Testes de segurança executados
- [ ] Penetration testing realizado

## 8. Headers de Segurança Recomendados

```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

**Implementação Data**: [DATA]
**Revisor de Segurança**: [NOME]
**Status**: [ ] Revisado [ ] Aprovado [ ] Implementado
