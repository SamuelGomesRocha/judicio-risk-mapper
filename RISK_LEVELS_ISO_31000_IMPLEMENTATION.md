# Implementação: Níveis de Risco ISO 31000 com Cores Configuráveis

**Data:** 10 de Fevereiro de 2026  
**Status:** ✅ Concluído

---

## 📋 Resumo Executivo

Implementado um sistema completo de **exibição de níveis de risco conforme ISO 31000** na tela de resultados, com suporte a:

- ✅ **Três novos campos por risco:** Probabilidade, Impacto, Risco Inerente
- ✅ **Exibição visual:** Badges coloridas conforme nível (BAIXO, MÉDIO, ALTO, EXTREMO, etc.)
- ✅ **Cores configuráveis:** Usuário pode personalizar cores na tela de Configurações
- ✅ **3ª Aba:** "Cores de Risco" adicionada ao modal de Configurações
- ✅ **Persistência:** Cores salvas em localStorage e propagadas ao longo do fluxo
- ✅ **Zero erros TypeScript**

---

## 🔧 Mudanças Técnicas Implementadas

### Novos Arquivos Criados

#### 1. **src/types/risk-colors.ts** (NEW)
Define sistema de cores para níveis de risco:
```typescript
interface RiskColorConfig {
  [level: string]: string;  // Mapa nível -> cor hex
}

const DEFAULT_RISK_COLORS: RiskColorConfig = {
  "MUITO BAIXO": "#1F2937",   // cinza escuro
  "BAIXO": "#F59E0B",         // amarelo
  "MÉDIO": "#F97316",         // laranja
  "ALTO": "#EF4444",          // vermelho
  "EXTREMO": "#7C3AED",       // roxo
  "MUITO RELEVANTE": "#EF4444",
  "RELEVANTE": "#F97316",
}

function getColorForLevel(level: string | undefined, colors: RiskColorConfig): string
```

#### 2. **src/components/RiskColorsTab.tsx** (NEW)
Componente de configuração de cores:
- Color pickers para cada nível
- Prévia em tempo real das cores
- Botão Reset para padrão
- Validação de cores hex

Estrutura:
```
┌─────────────────────────────┐
│ Cores por Nível de Risco    │
├─────────────────────────────┤
│ [●] MUITO BAIXO  #1F2937   │
│ [●] BAIXO        #F59E0B   │
│ [●] MÉDIO        #F97316   │
│ [●] ALTO         #EF4444   │
│ [●] EXTREMO      #7C3AED   │
├─────────────────────────────┤
│ [Resetar Cores Padrão]      │
└─────────────────────────────┘
```

### Arquivos Modificados

#### 1. **src/types/risk.ts**
Adicionados campos opcionais a `RiskAnalysis`:
```typescript
probabilidade?: number;
nivel_probabilidade?: string;
impacto?: number;
nivel_impacto?: string;
risco_inerente?: number;
nivel_risco_inerente?: string;
```

#### 2. **src/types/config.ts**
Adicionado campo a `ConfigSettings`:
```typescript
riskColors: RiskColorConfig;
```

Importações adicionadas:
```typescript
import { RiskColorConfig, DEFAULT_RISK_COLORS } from "@/types/risk-colors";
```

#### 3. **src/components/ConfigModal.tsx**
Atualizações:
- 3 abas: API | Escalas de Risco | **Cores de Risco** (NEW)
- Grid alterado de 2 para 3 colunas
- Imports adicionados para RiskColorsTab e Palette icon
- Schema Zod com validação de cores hex

#### 4. **src/components/RiskTable.tsx**
Reescrito completamente:
- Adicionadas 3 novas colunas:
  - **Probabilidade** (centro, badge colorido)
  - **Impacto** (centro, badge colorido)
  - **Risco Inerente** (centro, badge colorido)
- Função `renderLevelBadge()` aplica cores conforme config
- Colunas redimensionadas para acomodar novos campos
- Suporte a cores customizadas via prop `riskColors`

Estrutura HTML das badges:
```tsx
<span
  className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
  style={{ backgroundColor: bgColor }}
>
  {level}
</span>
```

#### 5. **src/pages/Upload.tsx**
Atualizado `handleSubmit()`:
```typescript
navigate("/loading", { 
  state: { 
    files: {...},
    config: config,
    riskColors: config?.riskColors  // NEW
  } 
});
```

#### 6. **src/pages/Results.tsx**
Atualizações:
- Imports de `RiskColorConfig` e `DEFAULT_RISK_COLORS`
- Extrai `riskColors` do state com fallback
- Passa `riskColors` prop para `RiskTable`
- Atualiza `generateCSV()` com 3 novos campos

#### 7. **src/pages/Loading.tsx**
Atualização na navegação para Results:
```typescript
navigate("/results", { 
  state: { 
    analysisData: data, 
    riskColors: configData?.riskColors || apiConfig.riskColors  // NEW
  } 
});
```

---

## 📊 Fluxo de Dados

```
┌──────────────────────────────────────────────────────┐
│ Upload Page (config + riskColors)                    │
└─────────────────┬──────────────────────────────────┘
                  │
                  ▼
        ConfigModal (3 abas)
        ├─ API ✓
        ├─ Escalas ✓
        └─ Cores de Risco (NEW)
                  │
                  ▼
        Loading Page (config + riskColors)
                  │
                  ├─ POST ao backend
                  │  └─ FormData + risk_scales
                  │
                  ▼
        Results Page (analysisData + riskColors)
                  │
                  ▼
        RiskTable (risks + riskColors)
                  │
                  ├─ Coluna Probabilidade (badge colorido)
                  ├─ Coluna Impacto (badge colorido)
                  └─ Coluna Risco Inerente (badge colorido)
```

---

## 🎨 Cores Padrão

| Nível | Hex | Cor |
|-------|-----|-----|
| MUITO BAIXO | #1F2937 | Cinza Escuro |
| BAIXO | #F59E0B | Amarelo |
| MÉDIO | #F97316 | Laranja |
| ALTO | #EF4444 | Vermelho |
| EXTREMO | #7C3AED | Roxo |

---

## 💾 Estrutura localStorage

A chave `app_config` agora inclui:

```json
{
  "url": "https://api.exemplo.com",
  "username": "user",
  "password": "pass",
  "aikey": "sk-proj-...",
  "riskLevels": [...],
  "riskColors": {
    "MUITO BAIXO": "#1F2937",
    "BAIXO": "#F59E0B",
    "MÉDIO": "#F97316",
    "ALTO": "#EF4444",
    "EXTREMO": "#7C3AED",
    "MUITO RELEVANTE": "#EF4444",
    "RELEVANTE": "#F97316"
  }
}
```

---

## 🧪 Teste Prático

### 1. Configurar Cores Personalizadas
1. Abra a página de Upload
2. Clique em "Configurar"
3. Vá para aba "Cores de Risco"
4. Mude cor do ALTO para azul (#0000FF)
5. Clique "Salvar Configurações"

### 2. Visualizar na Tabela
1. Faça upload de documentos
2. Aguarde análise
3. Na tela de Resultados:
   - Veja as 3 novas colunas
   - Observe badges com cores customizadas
   - Risco com nível "ALTO" aparecerá em azul

---

## ✨ Resumo de Mudanças

| Item | Status |
|------|--------|
| Tipo RiskAnalysis com 6 campos novos | ✅ |
| Arquivo risk-colors.ts criado | ✅ |
| RiskColorConfig em ConfigSettings | ✅ |
| RiskColorsTab criado | ✅ |
| ConfigModal com 3 abas | ✅ |
| RiskTable com 3 novas colunas | ✅ |
| Upload.tsx atualizado | ✅ |
| Results.tsx atualizado | ✅ |
| Loading.tsx atualizado | ✅ |
| localStorage com riskColors | ✅ |
| Erros TypeScript | ✅ Zero |

---

## 🎯 Próximos Passos (Opcional)

1. **Presets de Cores:** Adicionar presets (Dark, Light, High Contrast)
2. **Padrão ISO 31000:** Cores oficiais conforme norma
3. **Legenda de Cores:** Exibir legenda na página de resultados
4. **Filtros:** Filtrar riscos por nível de risco
5. **Gráficos:** Gráfico de distribuição de riscos por nível

---

## 📝 Notas de Implementação

### Compatibilidade
- ✅ Compatível com dados legados (campos opcionais)
- ✅ Fallback para cores padrão se não fornecidas
- ✅ Suporta qualquer nome de nível vindo do backend

### Performance
- ✅ Sem requisições adicionais (cores apenas em localStorage)
- ✅ Renderização eficiente com React memo (potencial otimização)
- ✅ Propagação de state apenas quando necessário

### Acessibilidade
- ✅ Badges com texto branco para contraste
- ✅ Suporte a modo claro/escuro via cores customizáveis
- ✅ Badges semânticas com estrutura HTML apropriada

---

**Implementação concluída com sucesso!** 🎉
