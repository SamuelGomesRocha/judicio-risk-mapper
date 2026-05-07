# Etapa 1: Build da aplicação
FROM oven/bun:latest AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json bun.lockb ./

# Instala as dependências com bun
RUN bun install --frozen-lockfile

# Copia o código fonte
COPY . .

# Build da aplicação React/Vite
RUN bun run build

# Etapa 2: Servidor Web (Nginx) para servir o front-end
FROM nginx:alpine

# Labels para metadados
LABEL maintainer="PRTI Especialista em Automações"
LABEL description="Risk Mapper - Judicial Risk Assessment Frontend"

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no build para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Melhora a segurança removendo o header do servidor
RUN sed -i 's/server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]