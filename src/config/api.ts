// Configuração da API do n8n
export const API_CONFIG = {
  // URL do webhook n8n cloud
  webhookUrl: "https://purple-frog-70.hooks.n8n.cloud/webhook-test/37b72fd6-0deb-48de-bca5-c85c3f5f2864",
  
  // Credenciais de autenticação básica
  auth: {
    username: "blueprince",
    password: "alohomora",
  },
  
  // Gera o header de autorização
  getAuthHeader: () => {
    const credentials = btoa(`${API_CONFIG.auth.username}:${API_CONFIG.auth.password}`);
    return `Basic ${credentials}`;
  },
};
