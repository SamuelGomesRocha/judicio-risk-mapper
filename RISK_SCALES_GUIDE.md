# Escalas de Risco - Guia de Uso

## 📋 Visão Geral

O sistema agora permite que você configure **escalas de risco personalizadas** que definem os níveis (EXTREMO, ALTO, MÉDIO, BAIXO) e suas respectivas faixas numéricas.

Essas configurações são enviadas ao backend em cada análise, permitindo que o cálculo de probabilidade e impacto utilize exatamente a escala que você definiu.

---

## 🎯 Escalas Padrão

Se nenhuma configuração for realizada, o sistema utilizará as escalas padrão:

| Nível | Escala |
|-------|--------|
| EXTREMO | 49 ≤ x ≤ 100 |
| ALTO | 25 ≤ x ≤ 48 |
| MÉDIO | 9 ≤ x ≤ 24 |
| BAIXO | 1 ≤ x ≤ 8 |

---

## 🔧 Como Configurar Escalas Personalizadas

### 1. Acessar as Configurações

Na página inicial, clique no botão **"Configurar"** (ou **"Reconfigurar"** se já houver configuração):

```
┌─────────────────────────────────────────┐
│  Análise Simplificada de Riscos         │
│                                         │
│              [Configurar API]           │
└─────────────────────────────────────────┘
```

### 2. Acessar a Aba "Escalas de Risco"

O modal de configurações apresenta **2 abas**:
- **API**: Configuração de URL, usuário, senha e token de IA
- **Escalas de Risco**: Gerenciamento de níveis de risco

Clique na aba **"Escalas de Risco"**:

```
┌─────────────────────────────────┐
│  [API]  [Escalas de Risco]      │
└─────────────────────────────────┘
```

### 3. Adicionar ou Modificar Níveis

Na aba de escalas, você verá:

```
┌─────────────────────────────────────────────┐
│  Níveis de Risco                            │
│                                             │
│  Nível          Mín.    Máx.               │
│  ┌────────────┬─────────┬─────────┬────┐   │
│  │ EXTREMO    │ 49      │ 100     │ ✕  │   │
│  ├────────────┼─────────┼─────────┼────┤   │
│  │ ALTO       │ 25      │ 48      │ ✕  │   │
│  ├────────────┼─────────┼─────────┼────┤   │
│  │ MÉDIO      │ 9       │ 24      │ ✕  │   │
│  ├────────────┼─────────┼─────────┼────┤   │
│  │ BAIXO      │ 1       │ 8       │ ✕  │   │
│  └────────────┴─────────┴─────────┴────┘   │
│                                             │
│  [Resetar Padrão]  [+ Adicionar Nível]    │
└─────────────────────────────────────────────┘
```

**Campos disponíveis:**
- **Nível**: Nome do nível (ex: EXTREMO, CRÍTICO, etc.)
- **Mín.**: Valor mínimo da faixa (inclusive)
- **Máx.**: Valor máximo da faixa (inclusive)
- **✕**: Botão para remover o nível

### 4. Exemplo: Criando Escalas Personalizadas

Suponha que você queira usar apenas 3 níveis com nomes diferentes:

**Passo 1:** Remova os níveis atuais clicando em **✕**

**Passo 2:** Clique em **"Adicionar Nível"** 3 vezes

**Passo 3:** Preencha os dados:

| Nível | Mín. | Máx. |
|-------|------|------|
| Pequeno | 1 | 30 |
| Médio | 31 | 70 |
| Grande | 71 | 100 |

**Resultado na prévia:**
```
Pequeno 1 ≤ x ≤ 30
Médio 31 ≤ x ≤ 70
Grande 71 ≤ x ≤ 100
```

---

## ⚙️ Validações

O sistema realiza as seguintes validações:

✅ **Nome do Nível obrigatório**
```
❌ Campo vazio → "Nome do nível é obrigatório"
✅ "EXTREMO", "Crítico", "A", etc. → Válido
```

✅ **Valores numéricos válidos**
```
❌ Mín ≥ Máx → "Valor mínimo deve ser menor que máximo"
✅ 1 ≤ 10 → Válido
✅ 0 ≤ 100 → Válido (aceita 0)
```

✅ **Valores positivos**
```
❌ -5 ≤ 10 → "Valores devem ser positivos"
✅ 0 ≤ 100 → Válido (0 é aceito)
```

---

## 💾 Armazenamento

As configurações são salvas em **localStorage** com a chave `app_config`:

```typescript
{
  "url": "https://api.exemplo.com/webhook",
  "username": "user",
  "password": "pass",
  "aikey": "sk-proj-xxx...",
  "riskLevels": [
    { "level": "EXTREMO", "minValue": 49, "maxValue": 100 },
    { "level": "ALTO", "minValue": 25, "maxValue": 48 },
    { "level": "MÉDIO", "minValue": 9, "maxValue": 24 },
    { "level": "BAIXO", "minValue": 1, "maxValue": 8 }
  ]
}
```

---

## 📤 Envio ao Backend

Quando você clica em **"Analisar Documentos"**, as escalas são enviadas ao backend via **FormData**:

```
POST /webhook

FormData:
├─ dod: [File]
├─ etp: [File]
├─ tr: [File]
└─ risk_scales: {
    "levels": [
      { "level": "EXTREMO", "minValue": 49, "maxValue": 100 },
      ...
    ],
    "timestamp": "2026-02-09T10:30:00Z"
  }
```

---

## 🔄 Resetar para Padrão

A qualquer momento, clique em **"Resetar Padrão"** para voltar às escalas padrão:

```
Nível   | Escala
--------|----------------
EXTREMO | 49 ≤ x ≤ 100
ALTO    | 25 ≤ x ≤ 48
MÉDIO   | 9 ≤ x ≤ 24
BAIXO   | 1 ≤ x ≤ 8
```

---

## 📝 Boas Práticas

1. **Garanta continuidade entre escalas**
   - ✅ BAIXO (1-10), MÉDIO (11-50), ALTO (51-100)
   - ❌ BAIXO (1-10), MÉDIO (20-50) ← há gap entre 11-19

2. **Use nomes descritivos**
   - ✅ EXTREMO, CRÍTICO, MODERADO, MÍNIMO
   - ❌ A, B, C, D

3. **Mantenha coerência com sua metodologia**
   - Se usa ISO 31000, respeite as categorias (Insignificante, Menor, Moderado, Maior, Catastrófico)

4. **Teste com dados reais**
   - Execute uma análise após configurar
   - Verifique se os riscos recebem as classificações esperadas

---

## 🛠️ Integração Backend

O backend recebe as escalas e deve usá-las para classificar riscos. Exemplo em Node.js:

```typescript
app.post('/webhook', async (req, res) => {
  const { risk_scales } = req.body;
  const levels = JSON.parse(risk_scales).levels;
  
  // Para cada risco calculado (ex: score = 75)
  const score = 75;
  const riskLevel = levels.find(
    (l: any) => score >= l.minValue && score <= l.maxValue
  );
  
  console.log(`Score ${score} mapeado para: ${riskLevel?.level}`);
  // Output: "Score 75 mapeado para: EXTREMO"
});
```

---

## ❓ FAQ

**P: Se não configurar escalas, o que acontece?**
R: O sistema usa as escalas padrão automaticamente.

**P: Posso ter escalas sobrepostas?**
R: Tecnicamente sim, mas não é recomendado. O backend usará a primeira correspondência.

**P: Quantos níveis posso adicionar?**
R: Sem limite técnico, mas recomenda-se não exceder 10 para manter clareza.

**P: As escalas podem ter valores decimais?**
R: Atualmente aceita apenas números inteiros. Valores decimais serão truncados.

**P: A configuração persiste?**
R: Sim, é salva em localStorage. Persiste até você limpar os dados do navegador ou reconfigurá-la.

---

## 📞 Suporte

Para dúvidas ou sugestões sobre as escalas de risco, consulte a documentação geral ou entre em contato com o time de desenvolvimento.
