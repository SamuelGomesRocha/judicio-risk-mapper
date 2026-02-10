# Documentação - Escalas de Risco

## 📚 Índice de Documentação

Bem-vindo! Esta seção documenta a nova funcionalidade de **Escalas de Risco Dinâmicas**.

---

## 👤 Para Usuários

### 📖 [RISK_SCALES_GUIDE.md](./RISK_SCALES_GUIDE.md)
**O que é:** Guia completo para usar as escalas de risco no frontend

**Contém:**
- Como acessar configurações
- Adição/remoção de níveis
- Validações e regras
- Exemplos práticos
- Boas práticas
- FAQ

**Leia se:** Você quer aprender como configurar escalas personalizadas na interface

---

## 👨‍💻 Para Desenvolvedores Backend

### 📖 [RISK_SCALES_BACKEND.md](./RISK_SCALES_BACKEND.md)
**O que é:** Guia técnico de integração com o backend

**Contém:**
- Estrutura do POST recebido
- Como parsear risk_scales
- Função de mapeamento (score → nível)
- Exemplos de código TypeScript/Node.js
- Validações e tratamentos de erro
- Teste com cURL
- Considerações de produção

**Leia se:** Você precisa implementar o lado backend desta funcionalidade

---

## 🏗️ Para Arquitetos

### 📖 [RISK_SCALES_IMPLEMENTATION.md](./RISK_SCALES_IMPLEMENTATION.md)
**O que é:** Documento técnico de implementação

**Contém:**
- Resumo executivo
- Mudanças técnicas detalhadas
- Arquivos criados/modificados
- Interface de usuário
- Formato de envio
- Fluxo end-to-end
- Checklist de implementação
- Próximos passos

**Leia se:** Você quer entender a arquitetura e decisões de design

---

## 🔄 Fluxo Rápido

```
Usuário              Frontend              Backend
  │                    │                     │
  ├─ Configura     → ConfigModal          
  │  escalas         (RiskScaleTab)        
  │
  ├─ Upload files  → Loading.tsx
  │                 (envia + escalas)  → /webhook
  │                                        │
  │                                    Processa com
  │                                    escalas config
  │                                        │
  │  ← Response com ← Results.tsx ←─ ─ ─ ─ ┘
  │    níveis
  │
```

---

## 📂 Estrutura de Arquivos

### Novos Arquivos
```
src/
├── types/
│   └── config.ts (tipos RiskLevel, ConfigSettings, DEFAULT_RISK_SCALE)
├── components/
│   ├── ConfigModal.tsx (modal com abas API + Escalas)
│   └── RiskScaleTab.tsx (gerenciador de escalas)
```

### Arquivos Modificados
```
src/
├── pages/
│   ├── Upload.tsx (usa ConfigModal, chave localStorage)
│   └── Loading.tsx (envia risk_scales ao backend)
```

### Documentação
```
projeto-root/
├── RISK_SCALES_GUIDE.md (usuário final)
├── RISK_SCALES_BACKEND.md (desenvolvedor backend)
└── RISK_SCALES_IMPLEMENTATION.md (arquiteto)
```

---

## ⚙️ Escalas Padrão

Se nenhuma configuração for feita:

```
Nível   │ Escala
────────┼─────────────────
EXTREMO │ 49 ≤ x ≤ 100
ALTO    │ 25 ≤ x ≤ 48
MÉDIO   │ 9 ≤ x ≤ 24
BAIXO   │ 1 ≤ x ≤ 8
```

---

## 🔧 Configuração Técnica

### Types
```typescript
interface RiskLevel {
  level: string;        // Nome (EXTREMO, ALTO, etc.)
  minValue: number;     // Valor mínimo
  maxValue: number;     // Valor máximo
}

interface ConfigSettings {
  url: string;
  username: string;
  password: string;
  aikey: string;
  riskLevels: RiskLevel[];
}
```

### localStorage
**Chave:** `app_config`  
**Conteúdo:** ConfigSettings (JSON)

### FormData (POST ao Backend)
```
dod: File
etp: File
tr: File
risk_scales: JSON string {
  levels: RiskLevel[],
  timestamp: ISO string
}
```

---

## ✅ Checklist de Implementação

- ✅ Frontend: Captura de escalas
- ✅ Frontend: Armazenamento em localStorage
- ✅ Frontend: Envio ao backend
- ⏳ Backend: Parsing de escalas
- ⏳ Backend: Mapeamento score → nível
- ⏳ Frontend: Exibição de níveis

---

## 🧪 Testes Básicos

### Para o Usuário
1. Abra a página de upload
2. Clique em "Configurar"
3. Vá para aba "Escalas de Risco"
4. Adicione um novo nível
5. Preencha: Nome, Min, Max
6. Clique em "Salvar Configurações"
7. Recarregue a página - configuração deve persister

### Para o Backend
1. Configure seu endpoint para receber FormData
2. Extraia `risk_scales` do FormData
3. Parse o JSON
4. Valide as escalas
5. Use para mapear scores → níveis

---

## 🚀 Próximos Passos

### Curto Prazo
- [ ] Backend implementar parsing de escalas
- [ ] Backend implementar mapeamento score → nível
- [ ] Frontend exibir "nivel" na tabela de riscos
- [ ] Testes end-to-end

### Médio Prazo
- [ ] Colorir riscos por nível na tabela
- [ ] Adicionar filtro por nível
- [ ] Histórico de escalas usadas

### Longo Prazo
- [ ] Presets de escalas (ISO 31000, NIST, etc.)
- [ ] Importar/Exportar configurações
- [ ] API REST para gerenciar escalas

---

## 📞 Suporte

### FAQ

**P: Onde as escalas são armazenadas?**  
R: Em localStorage com chave `app_config`. Persistem entre sessões.

**P: E se o backend não implementar o mapeamento?**  
R: Os dados são enviados mesmo assim. O backend pode ignorar ou implementar fallback.

**P: Posso ter escalas sobrepostas?**  
R: Tecnicamente sim, mas não é recomendado.

**P: Qual é o máximo de níveis?**  
R: Sem limite técnico, mas recomenda-se ≤10.

---

## 📋 Mudanças Recentes

**Data:** 9 de Fevereiro de 2026

- ✅ Criado `types/config.ts`
- ✅ Criado `components/RiskScaleTab.tsx`
- ✅ Refatorado `components/ConfigModal.tsx` com abas
- ✅ Atualizado `pages/Upload.tsx`
- ✅ Atualizado `pages/Loading.tsx` para enviar escalas
- ✅ Removido `components/ApiConfigModal.tsx`
- ✅ Criada documentação completa

---

## 🎓 Para Aprender Mais

1. **Comece com:** RISK_SCALES_GUIDE.md (interface)
2. **Depois leia:** RISK_SCALES_IMPLEMENTATION.md (arquitetura)
3. **Para backend:** RISK_SCALES_BACKEND.md (integração)

---

## 🔗 Links Relacionados

- [SECURITY_README.md](./SECURITY_README.md) - Segurança de tokens
- [CONFIGURACAO.md](./CONFIGURACAO.md) - Configuração geral do projeto
- [FRONTEND_BACKEND_TOKEN_FLOW.md](./FRONTEND_BACKEND_TOKEN_FLOW.md) - Fluxo de token

---

## 📊 Resumo de Arquivos

| Arquivo | Tipo | Status | Descrição |
|---------|------|--------|-----------|
| RISK_SCALES_GUIDE.md | Doc | ✅ | Guia do usuário |
| RISK_SCALES_BACKEND.md | Doc | ✅ | Guia do desenvolvedor |
| RISK_SCALES_IMPLEMENTATION.md | Doc | ✅ | Resumo técnico |
| types/config.ts | Código | ✅ | Tipos de configuração |
| components/RiskScaleTab.tsx | Código | ✅ | Componente UI |
| components/ConfigModal.tsx | Código | ✅ | Modal refatorado |
| pages/Upload.tsx | Código | ✅ | Atualizado |
| pages/Loading.tsx | Código | ✅ | Atualizado |

---

**Última atualização:** 9 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Produção

