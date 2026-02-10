# Guia do Usuário - Configuração de Cores de Risco

**ISO 31000 | Análise de Riscos | Personalização Visual**

---

## 🎨 Novo: Aba "Cores de Risco"

Agora você pode personalizar as cores que aparecem na tabela de resultados para cada nível de risco.

---

## 📍 Como Acessar

1. **Página de Upload** → Clique em **"Configurar"** (ou **"Reconfigurar"**)
2. Abre o modal **"Configurações"** com 3 abas:
   - **API** - Conexão e credenciais
   - **Escalas de Risco** - Níveis e ranges
   - **Cores de Risco** ← NOVO!

---

## 🖌️ Como Personalizar Cores

### Interface da Aba "Cores de Risco"

Você verá uma lista de níveis com seus seletores de cor:

```
┌──────────────────────────────────────────────┐
│ Cores por Nível de Risco                     │
│                                              │
│ [●] MUITO BAIXO    #1F2937  [input hex]    │
│ [●] BAIXO          #F59E0B  [input hex]    │
│ [●] MÉDIO          #F97316  [input hex]    │
│ [●] ALTO           #EF4444  [input hex]    │
│ [●] EXTREMO        #7C3AED  [input hex]    │
│ [●] MUITO REL...   #EF4444  [input hex]    │
│ [●] RELEVANTE      #F97316  [input hex]    │
│                                              │
│         [Prévia das Cores]                  │
│         • MUITO BAIXO   #1F2937             │
│         • BAIXO         #F59E0B             │
│         • ...                               │
│                                              │
│    [Resetar Cores Padrão]                   │
└──────────────────────────────────────────────┘
```

### Passo a Passo

**Opção 1: Clicando no Quadrado de Cor**
1. Clique no quadrado colorido (●) ao lado do nível
2. Abre seletor de cor do navegador
3. Escolha a nova cor
4. Clique fora para confirmar

**Opção 2: Digitando o Código Hex**
1. Localize o campo hex (ex: #1F2937)
2. Delete o conteúdo
3. Digite novo código (ex: #FF0000 para vermelho)
4. Pressione Enter ou clique fora

---

## 🎯 Níveis de Risco Padrão

| Nível | Cor Padrão | Descrição |
|-------|-----------|-----------|
| **MUITO BAIXO** | Cinza Escuro (#1F2937) | Praticamente negligenciável |
| **BAIXO** | Amarelo (#F59E0B) | Risco reduzido |
| **MÉDIO** | Laranja (#F97316) | Risco moderado |
| **ALTO** | Vermelho (#EF4444) | Risco significativo |
| **EXTREMO** | Roxo (#7C3AED) | Risco crítico |

---

## 🔄 Resetar para Padrão

Se quiser voltar às cores originais:
1. Clique em **"Resetar Cores Padrão"**
2. Confirme a mensagem de confirmação
3. Todas as cores retornam ao padrão

---

## 🖥️ Como Aparecem na Tabela de Resultados

Quando você vê a análise de riscos, cada risco mostra 3 badges com cores:

```
Evento de Risco  | Causas | Consequências | Probabilidade | Impacto | Risco Inerente
─────────────────┼────────┼───────────────┼───────────────┼─────────┼────────────────
Falha no HD      | ...    | ...           | [BAIXA]       | [ALTO]  | [EXTREMO]
                 |        |               |               |         |
Perda de dados   | ...    | ...           | [MÉDIA]       | [ALTO]  | [EXTREMO]
```

Cada badge colorido usa a cor que você configurou para aquele nível.

---

## 💡 Dicas de Uso

### Melhorar Legibilidade
- Use cores com bom contraste
- Exemplo: **Fundo escuro** com **texto claro** funcionam bem
- Evite cores muito parecidas

### Conformidade ISO 31000
Use este mapeamento recomendado:

| Nível | Cor | Justificativa |
|-------|-----|---------------|
| Insignificante | Cinza | Sem urgência |
| Menor | Amarelo/Verde | Pouca atenção |
| Moderado | Laranja | Atenção recomendada |
| Maior | Vermelho | Atenção urgente |
| Catastrófico | Roxo/Preto | Ação imediata |

### Modo Dark vs Light
Se usar diferentes modos visuais:
- **Light Mode:** Use cores vibrantes (mais brilho)
- **Dark Mode:** Use cores claras (melhor contraste)

---

## ❓ Perguntas Frequentes

**P: As cores são salvas automaticamente?**  
R: Sim! Quando você clica "Salvar Configurações", as cores são armazenadas no navegador e reutilizadas nas próximas análises.

**P: Posso usar cor transparente?**  
R: Não. O sistema requer cores hex válidas. Mas você pode usar tons muito claros para simular transparência.

**P: Todas as análises usam as mesmas cores?**  
R: Sim! As cores são globais para a aplicação. Todas as análises que você fazer usarão o mesmo esquema.

**P: E se eu resetar o navegador?**  
R: As cores são salvas em localStorage. Se limpar o cache/cookies, as cores voltam ao padrão. Neste caso, reconfigure conforme desejar.

**P: Posso ter 2 esquemas de cores diferentes?**  
R: Atualmente não. Há apenas 1 configuração ativa por vez. Se precisar alternar, reconfigure manualmente na tela de Configurações.

**P: Qual é o formato correto do código hex?**  
R: Sempre use 6 dígitos após o # (ex: #FF5500)
- Válido: #FF5500, #123ABC, #000000
- Inválido: #FFF, #FF55, 255,85,0

---

## 🔐 Privacidade

As cores são salvas apenas no seu navegador (localStorage), não são enviadas ao servidor.

---

## 📚 Mais Informações

Para detalhes técnicos e de implementação, veja:
- `RISK_LEVELS_ISO_31000_IMPLEMENTATION.md` - Detalhes técnicos
- `RISK_SCALES_GUIDE.md` - Configuração de escalas de risco
- `RISK_SCALES_BACKEND.md` - Integração com backend

---

**Começar a personalizar! 🎨**
