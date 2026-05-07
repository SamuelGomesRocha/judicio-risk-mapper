# Docker Deployment Guide - Risk Mapper

## Visão Geral
Este guia apresenta como fazer o build, testar e fazer deploy da aplicação Risk Mapper usando Docker.

## Pré-requisitos
- Docker instalado (versão 20.10+)
- Docker Compose instalado (versão 2.0+)
- Bun ou Node.js (para desenvolvimento local)

## Build da Imagem Docker

### Build padrão (Produção)
```bash
docker build -t risk-mapper:latest .
```

### Build com tag customizada
```bash
docker build -t risk-mapper:v1.0.0 .
```

## Executar com Docker Compose

### Desenvolvimento
```bash
docker-compose -f docker-compose.yml up --build
```

### Produção
```bash
docker-compose -f docker-compose.yml up -d
```

### Parar os containers
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f frontend
```

## Executar container diretamente

### Desenvolvimento (modo interativo)
```bash
docker run -it --rm -p 8080:80 risk-mapper:latest
```

### Produção (modo daemon)
```bash
docker run -d --name risk-mapper -p 8080:80 risk-mapper:latest
```

## Verificar container

### Status de saúde
```bash
docker ps
```

### Logs
```bash
docker logs risk-mapper-frontend
```

### Acessar shell do container
```bash
docker exec -it risk-mapper-frontend sh
```

## Otimizações da Imagem

### Tamanho da imagem
O Dockerfile segue best practices:
- ✅ Multi-stage build
- ✅ Imagem Alpine (pequena)
- ✅ .dockerignore (reduz contexto)
- ✅ Congelamento de dependências (reproducibilidade)

### Performance
- ✅ Health checks configurados
- ✅ Nginx otimizado para SPAs
- ✅ Gzip habilitado
- ✅ Cache de camadas Docker

## Ambiente de Produção

Para fazer deploy em produção, considere:

1. **Registry privado**: Fazer push da imagem
```bash
docker tag risk-mapper:latest your-registry/risk-mapper:latest
docker push your-registry/risk-mapper:latest
```

2. **Orchestração**: Usar Kubernetes ou Docker Swarm
3. **Environment variables**: Criar arquivo `.env.production`
4. **Reverse proxy**: Colocar atrás de nginx/traefik
5. **SSL/TLS**: Configurar certificados

## Troubleshooting

### Container não inicia
```bash
docker logs risk-mapper-frontend
```

### Porta já em uso
```bash
docker ps
docker stop <container-id>
```

### Limpar imagens não usadas
```bash
docker image prune
docker system prune
```

### Rebuild sem cache
```bash
docker build --no-cache -t risk-mapper:latest .
```

## Segurança

A configuração inclui:
- ✅ Imagem alpine (menor superfície de ataque)
- ✅ Container executa como non-root
- ✅ Read-only filesystem para arquivos compilados
- ✅ Health checks
- ✅ Server tokens desabilitados no Nginx

## Monitoramento

Health check endpoint:
```bash
curl -v http://localhost:8080/index.html
```

Métricas:
```bash
docker stats risk-mapper-frontend
```

## Próximos Passos

- [ ] Configurar CI/CD (GitHub Actions, GitLab CI, etc.)
- [ ] Setup de container registry
- [ ] Configurar logging centralizado
- [ ] Implementar monitoring com Prometheus/Grafana
- [ ] Backup strategy para dados persistentes
