# Integração Backend - Escalas de Risco

## 📋 Visão Geral

O frontend agora envia as **escalas de risco configuradas** ao backend em cada requisição de análise. O backend deve usar essas escalas para mapear scores numéricos para níveis de risco.

---

## 📤 Estrutura do POST do Frontend

### Headers

```http
POST /webhook HTTP/1.1
Host: seu-backend.com
Authorization: Basic YmxldWRyaW5jZTphbGFob21vcmE=
Content-Type: multipart/form-data; boundary=...
```

### Body - FormData

```
FormData:
├─ dod: [File] "1. DOD.pdf"
├─ etp: [File] "2. ETP.pdf"
├─ tr: [File] "3. TR.pdf"
└─ risk_scales: {
    "levels": [
      {
        "level": "EXTREMO",
        "minValue": 49,
        "maxValue": 100
      },
      {
        "level": "ALTO",
        "minValue": 25,
        "maxValue": 48
      },
      {
        "level": "MÉDIO",
        "minValue": 9,
        "maxValue": 24
      },
      {
        "level": "BAIXO",
        "minValue": 1,
        "maxValue": 8
      }
    ],
    "timestamp": "2026-02-09T10:30:00Z"
  }
```

---

## 🔄 Processamento no Backend

### 1. Receber e Parsear Escalas

```typescript
import express from 'express';
import formidable from 'formidable';

app.post('/webhook', async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    const [fields, files] = await form.parse(req);

    // Extrair escalas de risco
    const riskScalesStr = fields.risk_scales?.[0];
    if (!riskScalesStr) {
      return res.status(400).json({
        status: 'error',
        message: 'Escalas de risco não fornecidas'
      });
    }

    const riskScales = JSON.parse(riskScalesStr);
    console.log('✓ Escalas recebidas:', riskScales.levels.map(
      (l: any) => `${l.level} (${l.minValue}-${l.maxValue})`
    ));

    // Arquivos
    const dodFile = files.dod?.[0];
    const etpFile = files.etp?.[0];
    const trFile = files.tr?.[0];

    if (!dodFile || !etpFile || !trFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos os três arquivos são obrigatórios'
      });
    }

    // Continuar processamento...
    const analysisResult = await analyzeDocuments(
      dodFile,
      etpFile,
      trFile,
      riskScales.levels
    );

    res.json(analysisResult);
  } catch (error) {
    console.error('Erro ao processar:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro ao processar'
    });
  }
});
```

### 2. Mapear Score para Nível de Risco

```typescript
interface RiskLevel {
  level: string;
  minValue: number;
  maxValue: number;
}

function getRiskLevelFromScore(score: number, levels: RiskLevel[]): string {
  // Validar que score está em um dos ranges
  const matchedLevel = levels.find(
    level => score >= level.minValue && score <= level.maxValue
  );

  if (!matchedLevel) {
    console.warn(
      `Score ${score} não corresponde a nenhum nível configurado`,
      `Níveis disponíveis: ${levels.map(l => `${l.level}(${l.minValue}-${l.maxValue})`).join(', ')}`
    );
    
    // Fallback: usar o mais próximo
    const sorted = [...levels].sort((a, b) => a.minValue - b.minValue);
    if (score < sorted[0].minValue) return sorted[0].level;
    return sorted[sorted.length - 1].level;
  }

  return matchedLevel.level;
}

// Exemplo de uso
const levels = [
  { level: "EXTREMO", minValue: 49, maxValue: 100 },
  { level: "ALTO", minValue: 25, maxValue: 48 },
  { level: "MÉDIO", minValue: 9, maxValue: 24 },
  { level: "BAIXO", minValue: 1, maxValue: 8 }
];

console.log(getRiskLevelFromScore(75, levels));  // Output: "EXTREMO"
console.log(getRiskLevelFromScore(30, levels));  // Output: "ALTO"
console.log(getRiskLevelFromScore(15, levels));  // Output: "MÉDIO"
console.log(getRiskLevelFromScore(5, levels));   // Output: "BAIXO"
```

### 3. Usar Escalas na Análise

```typescript
interface RiskAnalysisItem {
  causa: string[];
  evento_de_risco: string;
  consequencia: string[];
  probabilidade?: number;
  impacto?: number;
  score?: number;
  nivel?: string;
}

async function analyzeDocuments(
  dodFile: formidable.File,
  etpFile: formidable.File,
  trFile: formidable.File,
  riskLevels: RiskLevel[]
): Promise<any> {
  // 1. Extrair texto dos PDFs
  const dodContent = await extractPdfText(dodFile.filepath);
  const etpContent = await extractPdfText(etpFile.filepath);
  const trContent = await extractPdfText(trFile.filepath);

  // 2. Chamar IA para análise
  const aiResponse = await callAIAnalysis({
    dod: dodContent,
    etp: etpContent,
    tr: trContent
  });

  // 3. Processar riscos com escalas
  const enrichedRisks = aiResponse.risks.map((risk: RiskAnalysisItem) => {
    // Calcular scores (exemplo)
    const probabilidade = calculateProbability(risk.causa);  // 1-10
    const impacto = calculateImpact(risk.consequencia);      // 1-10
    const score = (probabilidade + impacto) * 5;            // 10-100
    
    // Mapear para nível
    const nivel = getRiskLevelFromScore(score, riskLevels);

    return {
      ...risk,
      probabilidade,
      impacto,
      score,
      nivel
    };
  });

  // 4. Retornar análise completa
  return {
    status: 'success',
    project_name: aiResponse.project_name,
    objectives: aiResponse.objectives,
    risks: enrichedRisks,
    processed_files: [
      dodFile.originalFilename,
      etpFile.originalFilename,
      trFile.originalFilename
    ],
    riskScales: {
      levels: riskLevels,
      appliedAt: new Date().toISOString()
    }
  };
}
```

### 4. Tratamento de Escalas Customizadas

Se o usuário configurar escalas diferentes das padrão, seu backend as receberá:

```typescript
// Exemplo 1: Escalas padrão (4 níveis)
{
  "levels": [
    { "level": "EXTREMO", "minValue": 49, "maxValue": 100 },
    { "level": "ALTO", "minValue": 25, "maxValue": 48 },
    { "level": "MÉDIO", "minValue": 9, "maxValue": 24 },
    { "level": "BAIXO", "minValue": 1, "maxValue": 8 }
  ]
}

// Exemplo 2: Escalas customizadas (3 níveis, nomes diferentes)
{
  "levels": [
    { "level": "Pequeno", "minValue": 1, "maxValue": 30 },
    { "level": "Médio", "minValue": 31, "maxValue": 70 },
    { "level": "Grande", "minValue": 71, "maxValue": 100 }
  ]
}

// Exemplo 3: Escalas muito customizadas (5 níveis detalhados)
{
  "levels": [
    { "level": "NEGLIGENCIÁVEL", "minValue": 1, "maxValue": 10 },
    { "level": "MENOR", "minValue": 11, "maxValue": 30 },
    { "level": "MODERADO", "minValue": 31, "maxValue": 60 },
    { "level": "MAIOR", "minValue": 61, "maxValue": 85 },
    { "level": "CATASTRÓFICO", "minValue": 86, "maxValue": 100 }
  ]
}
```

---

## 📊 Resposta Enriquecida

Quando você retorna a análise para o frontend, inclua também o mapeamento de escalas:

```json
{
  "status": "success",
  "project_name": "Contratação de Infraestrutura Cloud",
  "objectives": [
    "Garantir conformidade com ISO 31000",
    "Identificar riscos técnicos",
    "Mapear causas e consequências"
  ],
  "risks": [
    {
      "causa": [
        "Falta de expertise em cloud",
        "Recursos limitados"
      ],
      "evento_de_risco": "Falha na migração para cloud",
      "consequencia": [
        "Indisponibilidade de serviços",
        "Perda de dados"
      ],
      "probabilidade": 7,
      "impacto": 9,
      "score": 80,
      "nivel": "EXTREMO"
    },
    {
      "causa": ["Mudança de requisitos"],
      "evento_de_risco": "Desalinhamento com o projeto",
      "consequencia": ["Retrabalho", "Atraso"],
      "probabilidade": 5,
      "impacto": 6,
      "score": 55,
      "nivel": "ALTO"
    }
  ],
  "processed_files": [
    "1. Documento de Oficialização da Demanda.pdf",
    "2. Estudo Técnico Preliminar.pdf",
    "3. Termo de Referência.pdf"
  ],
  "riskScales": {
    "levels": [
      { "level": "EXTREMO", "minValue": 49, "maxValue": 100 },
      { "level": "ALTO", "minValue": 25, "maxValue": 48 },
      { "level": "MÉDIO", "minValue": 9, "maxValue": 24 },
      { "level": "BAIXO", "minValue": 1, "maxValue": 8 }
    ],
    "appliedAt": "2026-02-09T10:30:00Z"
  }
}
```

---

## 🧪 Teste com cURL

```bash
# Teste básico enviando escalas
curl -X POST http://localhost:3000/webhook \
  -H "Authorization: Basic YmxldWRyaW5jZTphbGFob21vcmE=" \
  -F "dod=@1.DOD.pdf" \
  -F "etp=@2.ETP.pdf" \
  -F "tr=@3.TR.pdf" \
  -F 'risk_scales={
    "levels": [
      {"level": "EXTREMO", "minValue": 49, "maxValue": 100},
      {"level": "ALTO", "minValue": 25, "maxValue": 48},
      {"level": "MÉDIO", "minValue": 9, "maxValue": 24},
      {"level": "BAIXO", "minValue": 1, "maxValue": 8}
    ]
  }'
```

---

## ⚠️ Considerações Importantes

### 1. Validação de Escalas

```typescript
function validateRiskScales(levels: RiskLevel[]): boolean {
  if (!levels || levels.length === 0) {
    console.error('Escalas de risco vazias');
    return false;
  }

  for (const level of levels) {
    if (!level.level || level.minValue === undefined || level.maxValue === undefined) {
      console.error('Escala incompleta:', level);
      return false;
    }

    if (level.minValue >= level.maxValue) {
      console.error(`Escala inválida: ${level.level} (${level.minValue}-${level.maxValue})`);
      return false;
    }
  }

  return true;
}
```

### 2. Fallback em Caso de Erro

```typescript
function getRiskLevelWithFallback(
  score: number,
  levels: RiskLevel[],
  defaultLevel: string = "MÉDIO"
): string {
  try {
    if (!levels || levels.length === 0) {
      console.warn('Nenhuma escala de risco fornecida, usando padrão');
      return defaultLevel;
    }

    const matched = levels.find(
      l => score >= l.minValue && score <= l.maxValue
    );

    return matched?.level || defaultLevel;
  } catch (error) {
    console.error('Erro ao mapear score para nível:', error);
    return defaultLevel;
  }
}
```

### 3. Logging de Decisões

```typescript
function logRiskMapping(score: number, level: string, levels: RiskLevel[]): void {
  const range = levels.find(l => l.level === level);
  console.log(
    `[RISK_MAPPING] Score: ${score} → Nível: ${level} (${range?.minValue}-${range?.maxValue})`
  );
}
```

---

## 🔄 Fluxo Completo

```
Frontend (ConfigModal)
    ↓
Usuário define escalas (ex: EXTREMO 49-100)
    ↓
Upload.tsx salva em localStorage
    ↓
User clica "Analisar Documentos"
    ↓
Loading.tsx envia FormData + risk_scales
    ↓
Backend recebe POST
    ↓
Backend extrai risk_scales
    ↓
Backend calcula scores (1-100)
    ↓
Backend mapeia scores para níveis
    ↓
Backend retorna análise com "nivel" em cada risco
    ↓
Frontend exibe riscos classificados
```

---

## 📝 Resumo das Mudanças

| Aspecto | Antes | Agora |
|--------|-------|-------|
| **Escalas de Risco** | Hardcoded no frontend | Configuráveis via modal |
| **Envio ao Backend** | Apenas arquivos | Arquivos + risk_scales |
| **FormData** | dod, etp, tr | dod, etp, tr, risk_scales |
| **Resposta Backend** | risks com causa/evento/consequencia | idem + probabilidade/impacto/score/nivel |
| **Nível de Risco** | Não incluído | Mapeado via escalas customizadas |

---

## 🤝 Próximos Passos

1. ✅ Frontend envia escalas
2. ⏳ Backend processa e usa as escalas
3. ⏳ Backend retorna riscos com níveis mapeados
4. ⏳ Frontend exibe níveis classificados
5. ⏳ Testes end-to-end
