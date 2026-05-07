# Deploy do Mapeador de Riscos Judiciais (Judício Risk Mapper)

## 📋 Visão Geral

Este documento descreve o processo de deploy da aplicação front-end do **Mapeador de Riscos Judiciais** para o GitHub Container Registry (GHCR) e posterior atualização em servidor de produção.

---

## 🔐 Pré-requisitos

### Ambiente Local
- **Docker**: Instalado e configurado
- **PowerShell 5.1+**: Para executar o script de deploy
- **Git**: Para controle de versão
- **GitHub Token**: PAT (Personal Access Token) com permissão para GHCR
  - Criar em: https://github.com/settings/tokens

### Servidor Destino
- **Docker**: Instalado e funcionando
- **Docker Compose**: Versão 3.8+
- **Acesso ao GHCR**: Autenticado via `docker login`

---

## 🚀 Como Usar o Script deploy.ps1

### 1. Configuração Inicial

O script `deploy.ps1` está configurado com os seguintes padrões:

| Parâmetro | Valor Padrão | Descrição |
|-----------|--------------|-----------|
| `Registry` | `ghcr.io` | GitHub Container Registry |
| `GithubUser` | `SamuelGomesRocha` | Proprietário do repositório |
| `ImageName` | `SAR_FRONT_END` | Nome da imagem (minúscula no GHCR) |
| `Tag` | `latest` | Tag da versão |
| `GithubToken` | *(já incluído)* | Token para autenticação |
| `TargetDirectory` | `c:/SAR/front-end` | Diretório destino no servidor |
| `Port` | `5731` | Porta de exposição no servidor |

### 2. Executando o Deploy

#### Opção A: Com Parâmetros Padrão
```powershell
.\deploy.ps1
```

#### Opção B: Com Parâmetros Customizados
```powershell
.\deploy.ps1 `
    -GithubUser "seu_usuario" `
    -GithubToken "ghp_seu_token" `
    -ImageName "SAR_FRONT_END" `
    -Tag "v1.0.0"
```

#### Opção C: Especificar Direção Alvo e Porta
```powershell
.\deploy.ps1 `
    -TargetDirectory "c:/SAR/front-end" `
    -Port 5731
```

### 3. Saída do Script

O script executa 3 etapas:

```
[1/3] Autenticação no GHCR
[2/3] Build da imagem Docker
[3/3] Push para o GitHub Container Registry
```

Ao final, exibe instruções para atualizar o servidor destino.

---

## 📦 Estrutura de Versão

A imagem é publicada como:
```
ghcr.io/samuelgomesrocha/sar_front_end:latest
ghcr.io/samuelgomesrocha/sar_front_end:v1.0.0  # (com tag específica)
```

---

## 🖥️ Atualização no Servidor Destino

Após executar o `deploy.ps1` localmente, no servidor destino:

### 1. Navegue para o Diretório do Projeto
```bash
cd c:/SAR/front-end
```

### 2. Verifique o docker-compose.yml

Certifique-se de que está usando a imagem correta:
```yaml
services:
  frontend:
    image: ghcr.io/samuelgomesrocha/sar_front_end:latest
    ports:
      - "5731:80"
```

### 3. Atualize a Imagem
```bash
docker pull ghcr.io/samuelgomesrocha/sar_front_end:latest
```

### 4. Reinicie o Container
```bash
docker-compose up -d
```

### 5. Verifique o Status
```bash
docker-compose ps
docker-compose logs -f
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Token do GitHub

- **NUNCA** commite o token em commits públicos!
- O arquivo `deploy.ps1` está no `.gitignore`
- Para mudar o token:
  1. Revogue o antigo em: https://github.com/settings/tokens
  2. Crie um novo com permissão mínima necessária
  3. Atualize o parâmetro `$GithubToken` no script

### Permissões do Token

O token necessita destas permissões:
- ✅ `write:packages` - Push de imagens
- ✅ `read:packages` - Pull de imagens (se privado)
- ❌ `repo` - NÃO é necessário
- ❌ `admin:repo_hook` - NÃO é necessário

---

## 🔧 Troubleshooting

### Erro: "Falha no login do Docker"
```powershell
# Tente fazer login manualmente
docker login ghcr.io -u SamuelGomesRocha -p seu_token
```

### Erro: "Falha no build da imagem"
```powershell
# Verifique o Dockerfile
docker build -t test:latest .

# Ou execute sem cache
docker build --no-cache -t test:latest .
```

### Erro: "Falha ao enviar (docker push)"
```powershell
# Verifique a autenticação
docker logout ghcr.io
docker login ghcr.io

# Tente novamente
.\deploy.ps1
```

### Container não inicia no servidor
```bash
# Verifique logs
docker-compose logs frontend

# Verifique se a porta está disponível
netstat -ano | findstr :5731

# Tente recriar o container
docker-compose down
docker-compose up -d
```

---

## 📊 Fluxo de Deploy

```
┌─────────────────────────────────────┐
│   Máquina Local (Desenvolvimento)  │
├─────────────────────────────────────┤
│  1. Fazer commit                    │
│  2. .\deploy.ps1                    │
│     ↓                               │
│  3. Build da imagem Docker          │
│  4. Push para ghcr.io               │
└────────────────────┬────────────────┘
                     │
                     ↓
         ┌──────────────────────┐
         │   GitHub GHCR        │
         │  (Armazenamento)     │
         └──────────────────┬───┘
                            │
                            ↓
        ┌───────────────────────────────┐
        │ Servidor Destino (Produção)  │
        ├───────────────────────────────┤
        │ 1. docker pull                │
        │ 2. docker-compose up -d       │
        │ 3. Acesso: :5731              │
        └───────────────────────────────┘
```

---

## 📝 Verificação de Saúde

A aplicação inclui health check automático:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/index.html"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

Verifique o status:
```bash
docker-compose ps
# Status deve ser "Up (healthy)"
```

---

## 🎯 Melhores Práticas

1. **Versionar Imagens**: Use tags semânticas (v1.0.0) e não apenas `latest`
2. **Monitorar Logs**: Sempre verifique `docker-compose logs` após deploy
3. **Fazer Backup**: Manter versões anteriores para rollback
4. **Testar Localmente**: Execute `docker-compose up -d` local antes de produção
5. **Documentar Mudanças**: Mantenha CHANGELOG.md atualizado

---

## 📞 Suporte

Para problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a seção Troubleshooting acima
3. Valide o Dockerfile: `docker build --no-cache .`
4. Teste a conectividade GHCR: `docker pull ghcr.io/samuelgomesrocha/sar_front_end:latest`

---

**Última atualização**: Março de 2026  
**Versão**: 1.0.0  
**Mantido por**: PRTI - Especialista em Automações
