# 🚀 Quick Reference - Risk Mapper Docker

## Comandos Mais Usados

### 🏗️ Build
```bash
# Build com tag
docker build -t risk-mapper:latest .

# Build sem cache (força rebuild)
docker build --no-cache -t risk-mapper:latest .

# Build com Compose
docker-compose build
```

### 🚀 Run / Deploy

#### Produção
```bash
# Com docker-compose (recomendado)
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps
```

#### Desenvolvimento
```bash
docker-compose -f docker-compose.dev.yml up
```

#### Direto com Docker
```bash
# Run
docker run -d -p 8080:80 --name risk-mapper risk-mapper:latest

# Stop
docker stop risk-mapper

# Remove
docker rm risk-mapper
```

### 📋 Informações

```bash
# Listar imagens
docker images

# Listar containers
docker ps          # rodando
docker ps -a       # todos

# Ver logs
docker logs risk-mapper-frontend          # últimas linhas
docker logs -f risk-mapper-frontend       # live/follow
docker logs --tail 50 risk-mapper-frontend  # últimas 50 linhas

# Verificar saúde
docker ps | grep healthy

# Ver stats/performance
docker stats risk-mapper-frontend
```

### 🔧 Debug / Maintenance

```bash
# Acessar container
docker exec -it risk-mapper-frontend sh

# Testar health check manualmente
docker exec risk-mapper-frontend wget -O- http://localhost/index.html

# Testar nginx config
docker exec risk-mapper-frontend nginx -t

# Ver estrutura arquivo dentro do container
docker exec risk-mapper-frontend ls -la /usr/share/nginx/html

# Copiar arquivo para fora
docker cp risk-mapper-frontend:/var/log/nginx/access.log ./logs/
```

### 🧹 Limpeza

```bash
# Remove image de teste
docker rmi risk-mapper:test

# Remove containers parados
docker container prune

# Remove imagens não usadas
docker image prune

# Limpeza completa (cuidado!)
docker system prune -a
```

---

## Atalhos Úteis

### Todos os comando de uma vez (Compose)
```bash
# Build, up e ver logs
docker-compose up --build && docker-compose logs -f
```

### Verificar tudo
```bash
# Status containers
docker-compose ps

# Logs
docker-compose logs

# Stats
docker stats --no-stream
```

### Development Workflow
```bash
# 1. Build
docker-compose -f docker-compose.dev.yml build

# 2. Run
docker-compose -f docker-compose.dev.yml up

# 3. Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f
```

---

## Variáveis de Ambiente

### Production (.env)
```env
NODE_ENV=production
VITE_API_BASE_URL=http://api.example.com
```

### Development (.env.local)
```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

---

## Portas Padrão

| Serviço | Porta Local | Porta Container | Descrição |
|---------|-------------|-----------------|-----------|
| Frontend (Prod) | 8080 | 80 | Nginx |
| Frontend (Dev) | 5173 | 5173 | Vite Dev |
| Frontend (Nginx) | 8080 | 80 | Preview |

---

## Problemas Comuns & Soluções

| Problema | Solução |
|----------|---------|
| "Port 8080 already in use" | `docker-compose down` ou mudar porta em yaml |
| "Container exited" | `docker logs -f container-name` |
| "Health check unhealthy" | `docker exec container wget http://localhost/` |
| "Nginx: [emerg] cannot open file" | Verificar paths em nginx.conf |
| "Build fails - package not found" | `docker build --no-cache` |

---

## Health Check

### Verificação Manual
```bash
curl http://localhost:8080/index.html
```

### Esperado
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
...
```

### Se não responder
```bash
docker logs risk-mapper-frontend
# Verificar se index.html existe:
docker exec risk-mapper-frontend ls /usr/share/nginx/html/
```

---

## Performance Optimization

### Cache Layers (Dockerfile)
```dockerfile
# Boa prática:
COPY package.json bun.lockb ./  # Roupa poucas dependências, cacheia bem
RUN bun install
COPY . .                        # Código muda frequente, vem depois
RUN bun run build
```

### Image Size
```bash
# Ver tamanho
docker image inspect risk-mapper:latest | grep -i size

# Reduzir:
# 1. Usar multi-stage (✅ já implementado)
# 2. Alpine base (✅ já implementado)
# 3. .dockerignore (✅ já implementado)
```

---

## Registry / Push

### Docker Hub
```bash
docker tag risk-mapper:latest username/risk-mapper:latest
docker push username/risk-mapper:latest
docker pull username/risk-mapper:latest
```

### Registry Privado
```bash
docker tag risk-mapper:latest registry.example.com/risk-mapper:v1.0
docker push registry.example.com/risk-mapper:v1.0
```

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: Build Docker Image
  run: docker build -t risk-mapper:latest .

- name: Push to Registry
  run: |
    docker tag risk-mapper:latest registry/risk-mapper:${{ github.sha }}
    docker push registry/risk-mapper:${{ github.sha }}
```

---

## Monitoramento

### Ver o que está consumindo recursos
```bash
docker stats --no-stream

# Output:
# CONTAINER   CPU %   MEM USAGE / LIMIT   MEM %   NET I/O
# risk-mapper 0.05%   12.3MiB / 1.95GiB   0.61%   ...
```

### Logs com timestamp
```bash
docker logs -f --timestamps risk-mapper-frontend
```

---

## Backup & Restore

### Backup Volume
```bash
docker run --rm -v risk-mapper-data:/data -v $(pwd):/backup \
  busybox tar czf /backup/data-backup.tar.gz -C /data .
```

### Restore Volume
```bash
docker run --rm -v risk-mapper-data:/data -v $(pwd):/backup \
  busybox tar xzf /backup/data-backup.tar.gz -C /data
```

---

## Links Úteis

- [Docker Docs](https://docs.docker.com)
- [Docker Compose Docs](https://docs.docker.com/compose)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Bun Package Manager](https://bun.sh)

---

**Última atualização**: 2026-02-20  
**Versão**: 1.0  
**Status**: ✅ Pronto para Produção
