# Configuração do RISCOTRON

## Visão Geral
Sistema de análise simplificada de riscos para contratações de TIC do Tribunal de Justiça do Estado de Goiás, baseado na ISO 31000.

## Configuração da API

### Arquivo: `src/config/api.ts`

Atualize as seguintes configurações antes de usar em produção:

```typescript
export const API_CONFIG = {
  // URL do webhook do n8n
  webhookUrl: "https://seu-servidor.com/webhook/...",
  
  // Credenciais de autenticação
  auth: {
    username: "seu-usuario",
    password: "sua-senha",
  },
};
```

## Fluxo do Sistema

1. **Upload** (`/`) - Usuário envia 3 arquivos PDF:
   - DOD (Documento de Oficialização da Demanda)
   - ETP (Estudo Técnico Preliminar)
   - TR (Termo de Referência)

2. **Loading** (`/loading`) - Sistema processa:
   - Envia arquivos via POST para o n8n
   - Exibe dicas da ISO 31000
   - Aguarda resposta do webhook

3. **Results** (`/results`) - Exibe análise:
   - Tabela expansível com riscos identificados
   - Causas, Consequências e Controles
   - Opção de exportar para CSV

## Formato de Resposta Esperado

O webhook deve retornar um array JSON no seguinte formato:

```json
[
  {
    "Causas": ["string"],
    "Evento de risco": "string",
    "Consequências": ["string"],
    "Controles": ["string"]
  }
]
```

## Estrutura da Requisição POST

- **Método**: POST
- **Autenticação**: Basic Auth
- **Content-Type**: multipart/form-data
- **Campos**:
  - `dod`: arquivo PDF
  - `etp`: arquivo PDF
  - `tr`: arquivo PDF

## Design System

O sistema utiliza cores institucionais do Poder Judiciário:

- **Primary**: Azul institucional (#1E5FA8)
- **Secondary**: Verde tecnológico (#2D8B74)
- **Background**: Gradiente suave azul/cinza

Todos os tokens de cor estão definidos em:
- `src/index.css` - Variáveis CSS
- `tailwind.config.ts` - Configuração Tailwind

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Router
- Sonner (toasts)
