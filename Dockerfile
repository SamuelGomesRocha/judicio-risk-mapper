# Etapa 1: Build da aplicação
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código fonte e gera o build de produção
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx) para servir o front-end
FROM nginx:alpine

# Copia a configuração customizada do Nginx (criaremos abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no build para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]