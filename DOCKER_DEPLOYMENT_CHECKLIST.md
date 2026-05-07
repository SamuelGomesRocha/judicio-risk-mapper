# 🐳 Docker Deployment Checklist

## Pre-Deploy Checklist

### Ambiente Local
- [ ] Docker Desktop instalado e rodando
- [ ] Docker Compose v2.0+
- [ ] Espaço em disco: ~5GB livre
- [ ] Bun v1.x ou Node.js v20+

### Código
- [ ] Todos os testes passando
- [ ] Build local funcionando (`bun run build`)
- [ ] Sem console errors/warnings
- [ ] .env configurado corretamente
- [ ] Dependências atualizadas

### Arquivos Docker
- [ ] ✅ Dockerfile presente
- [ ] ✅ Dockerfile.dev presente
- [ ] ✅ docker-compose.yml presente
- [ ] ✅ docker-compose.dev.yml presente
- [ ] ✅ .dockerignore presente
- [ ] ✅ nginx.conf presente

---

## Build & Test Locally

### 1. Build da Imagem
```bash
# Limpar builds antigos (opcional)
docker image prune -a

# Build novo
docker build -t risk-mapper:dev .

# Verificar imagem
docker images | grep risk-mapper
```
**Esperado**: Imagem criada com sucesso (~94MB)

### 2. Test Container Direto
```bash
# Run container
docker run -d --name test-risk-mapper -p 8080:80 risk-mapper:dev

# Verificar saúde
docker ps | grep test-risk-mapper

# Testar endpoint
curl http://localhost:8080/index.html

# Ver logs
docker logs test-risk-mapper

# Cleanup
docker stop test-risk-mapper
docker rm test-risk-mapper
```
**Esperado**: Container roda, responde na porta 8080, health check OK

### 3. Test com Docker Compose
```bash
# Build via compose
docker-compose up --build -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f frontend

# Testar
curl http://localhost:8080

# Cleanup
docker-compose down
```
**Esperado**: Serviço roda, health check passa, acesso via http://localhost:8080

---

## Production Deployment

### Fase 1: Preparação
- [ ] Revisar variáveis de ambiente (.env)
- [ ] Confirmar configurações de porta
- [ ] Validar arquivo nginx.conf
- [ ] Revisar DOCKERFILE (não há hardcoded secrets)
- [ ] Testar full rebuild em máquina limpa

### Fase 2: Registry (se necessário)
```bash
# Login no registry
docker login your-registry.com

# Tag imagem
docker tag risk-mapper:latest your-registry/risk-mapper:v1.0.0

# Push
docker push your-registry/risk-mapper:v1.0.0
```

### Fase 3: Deploy
```bash
# Em servidor de produção
docker-compose -f docker-compose.yml up -d

# Verificar
docker-compose ps
docker-compose logs frontend
```

### Fase 4: Validação Pós-Deploy
- [ ] Container está rodando
- [ ] Health check passa
- [ ] Aplicação acessível
- [ ] Sem errors nos logs
- [ ] CPU/Memory dentro do esperado
- [ ] Certificado SSL válido (se HTTPS)

---

## Monitoring Pós-Deploy

### Logs
```bash
# Logs em tempo real
docker-compose logs -f

# Últimos 100 linhas
docker logs --tail 100 risk-mapper-frontend
```

### Performance
```bash
# Estatísticas
docker stats

# Usar para alertas:
# - Memory: <200MB (valor normal)
# - CPU: <5% (idle)
```

### Health Checks
```bash
# Verificar status
docker ps | grep risk-mapper

# Status esperado: healthy (verde)
# Se unhealthy: docker logs para debug
```

---

## Troubleshooting

### Container não inicia
```bash
# 1. Verificar logs
docker logs risk-mapper-frontend

# 2. Validar arquivo nginx.conf
docker run -it --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine nginx -t

# 3. Rebuild sem cache
docker build --no-cache -t risk-mapper:latest .
```

### Health check falha
```bash
# Testar manualmente
docker exec risk-mapper-frontend wget -O- http://localhost/index.html

# Se 404: verificar se dist/ foi copiado
docker exec risk-mapper-frontend ls -la /usr/share/nginx/html

# Se vazio: rebuild necessário
```

### Porta 8080 em uso
```bash
# Encontrar container usando a porta
lsof -i :8080  # macOS/Linux
netstat -ano | grep 8080  # Windows

# Mudar porta em docker-compose.yml
ports:
  - "9000:80"  # Mudar 8080 para 9000

# Depois:
docker-compose down
docker-compose up -d
```

### BuildX errors
```bash
# Limpar build cache
docker buildx prune -a

# Rebuild
docker build --no-cache -t risk-mapper:latest .
```

---

## Rollback Plan

Se algo der errado em produção:

### Quick Rollback
```bash
# Parar versão nova
docker-compose down

# Voltar para versão anterior (se tag existe)
docker run -d --name risk-mapper -p 8080:80 risk-mapper:v1.0.0

# Ou usar imagem anterior
docker-compose up -d  # se versionado em compose
```

### Dados/Persistência
```bash
# Backup antes de deploy
docker exec risk-mapper-frontend tar czf backup.tar.gz /usr/share/nginx/html

# Se necessário restore
docker cp backup.tar.gz container:/
docker exec container tar xzf backup.tar.gz
```

---

## Performance Targets

| Métrica | Esperado | Crítico |
|---------|----------|---------|
| Startup | <5s | >15s |
| Memory | 10-50MB | >200MB |
| CPU (idle) | <1% | >10% |
| Requests/s | >1000 | <100 |
| Latência | <100ms | >500ms |

---

## Security Checklist

- [ ] Sem hardcoded secrets em Dockerfile
- [ ] .env não committed
- [ ] nginx.conf não expõe versão
- [ ] Health check validado
- [ ] Volumes em read-only (dist/)
- [ ] Container roda como non-root
- [ ] Base image atualizado (nginx:alpine)

---

## Documentação Relacionada

- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Guia completo
- **[DOCKER_READY.md](DOCKER_READY.md)** - Status de preparo
- **[docker-compose.yml](docker-compose.yml)** - Config produção
- **[Dockerfile](Dockerfile)** - Build produção

---

## Contatos & Suporte

**Problemas Docker**: Verificar logs com `docker logs`  
**Problemas Nginx**: Verificar `nginx.conf`  
**Problemas App**: Verificar console do navegador (DevTools)  

---

## Sign-off

- [ ] Deploy checklist completo
- [ ] Testes em staging passaram
- [ ] Aprovação para produção
- [ ] Rollback plan pronto
- [ ] Monitoramento configurado
- [ ] Time notificado

**Responsável**: ___________________  
**Data**: ___________________  
**Versão Deploy**: ___________________  

---

**Status**: Ready for Production ✅
