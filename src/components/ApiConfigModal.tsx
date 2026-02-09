import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Lock, AlertTriangle, Info } from "lucide-react";
import { validateHttpsUrl } from "@/types/security";

const apiConfigSchema = z.object({
  url: z.string().url({ message: "URL inválida" }).min(1, { message: "URL é obrigatória" }).refine(
    (url) => {
      // Em testes/desenvolvimento: aceita HTTP também
      // Em produção: força HTTPS apenas
      const isDevelopment = import.meta.env.DEV || !import.meta.env.PROD;
      if (isDevelopment) {
        // Aceita HTTP e HTTPS em desenvolvimento
        return url.startsWith('http://') || url.startsWith('https://');
      }
      // Em produção: apenas HTTPS
      return validateHttpsUrl(url);
    },
    { message: "URL deve usar HTTPS em produção (TLS 1.3 recomendado)" }
  ),
  username: z.string().min(1, { message: "Usuário é obrigatório" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
  aikey: z.string()
    .min(20, { message: "Token de IA deve ter no mínimo 20 caracteres" })
    .regex(/^[a-zA-Z0-9\-_]+$/, { message: "Token deve conter apenas caracteres alfanuméricos, hífens e underscores" })
    .min(1, { message: "Chave de API da IA é obrigatória" }),
});

export type ApiConfig = z.infer<typeof apiConfigSchema>;

interface ApiConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ApiConfig) => void;
  initialConfig?: ApiConfig;
}

export function ApiConfigModal({ open, onOpenChange, onSave, initialConfig }: ApiConfigModalProps) {
  const form = useForm<ApiConfig>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: initialConfig || {
      url: "",
      username: "",
      password: "",
      aikey: "",
    },
  });

  const handleSubmit = (data: ApiConfig) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Configuração da API</DialogTitle>
          </div>
          <DialogDescription>
            Configure as credenciais de acesso à API para realizar a análise de riscos.
            Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
            {/* Security Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 ml-2">Segurança de Dados</AlertTitle>
              <AlertDescription className="text-blue-800 text-xs ml-6 mt-2">
                <ul className="space-y-1 list-disc list-inside">
                  <li>HTTPS/TLS 1.3 obrigatório para transmissão ao backend <span className={import.meta.env.DEV ? "text-amber-600 font-semibold" : ""}>{import.meta.env.DEV ? "(HTTP aceito em testes)" : ""}</span></li>
                  <li>Token será enviado criptografado para o servidor</li>
                  <li>Backend armazena no Secrets Manager (AWS/Azure/GCP)</li>
                  <li>Implementa OAuth 2.0 + JWT no backend</li>
                </ul>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    URL da API
                    <Lock className="w-3 h-3 text-green-600" />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://api.exemplo.com/webhook" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">Deve usar HTTPS (TLS 1.3 mínimo)</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o usuário" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Digite a senha" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aikey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Token IA (AES-256 Criptografado)
                    <Lock className="w-3 h-3 text-amber-600" />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="sk-proj-... (mínimo 20 caracteres)" 
                      {...field} 
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="space-y-2 mt-2 p-3 bg-amber-50 rounded border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-semibold mb-1">Importante:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Será enviado criptografado ao backend via POST</li>
                          <li>Backend armazena no Secrets Manager com AES-256</li>
                          <li>SessionStorage limpado após envio bem-sucedido</li>
                          <li>NUNCA será armazenado em localStorage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Alert className="bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900 ml-2">Backend Proxy Pattern</AlertTitle>
              <AlertDescription className="text-green-800 text-xs ml-6 mt-2">
                O backend utilizará a chave de IA do Secrets Manager (AWS/Azure/GCP) com criptografia AES-256. Nenhuma chave será armazenada no navegador.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Configuração
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
