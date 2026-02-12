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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Lock, AlertTriangle, Info, Database, Sliders, Palette, Sparkles } from "lucide-react";
import { validateHttpsUrl } from "@/types/security";
import { ConfigSettings, DEFAULT_RISK_SCALE, RiskLevel } from "@/types/config";
import { RiskScaleTab } from "@/components/RiskScaleTab";
import { RiskColorsTab } from "@/components/RiskColorsTab";
import { RagTab } from "@/components/RagTab";
import { DEFAULT_RISK_COLORS, RiskColorConfig } from "@/types/risk-colors";
import { RagData } from "@/types/rag";

const configSettingsSchema = z.object({
  url: z.string().url({ message: "URL inválida" }).min(1, { message: "URL é obrigatória" }).refine(
    (url) => {
      const isDevelopment = import.meta.env.DEV || !import.meta.env.PROD;
      if (isDevelopment) {
        return url.startsWith('http://') || url.startsWith('https://');
      }
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
  riskLevels: z.array(
    z.object({
      level: z.string().min(1, "Nome do nível é obrigatório"),
      minValue: z.number().min(0, "Valor mínimo deve ser positivo"),
      maxValue: z.number().positive("Valor máximo deve ser maior que zero"),
    }).refine(
      (data) => data.minValue < data.maxValue,
      { message: "Valor mínimo deve ser menor que máximo", path: ["minValue"] }
    )
  ).min(1, "Deve haver pelo menos um nível de risco"),
  riskColors: z.record(z.string(), z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido (#RRGGBB)")).default(DEFAULT_RISK_COLORS),
  ragData: z.any().optional(),
});

export type ApiConfig = z.infer<typeof configSettingsSchema>;

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ConfigSettings) => void;
  initialConfig?: ConfigSettings;
}

export function ConfigModal({ open, onOpenChange, onSave, initialConfig }: ConfigModalProps) {
  const form = useForm<ConfigSettings>({
    resolver: zodResolver(configSettingsSchema),
    defaultValues: initialConfig || {
      url: "",
      username: "",
      password: "",
      aikey: "",
      riskLevels: DEFAULT_RISK_SCALE,
      riskColors: DEFAULT_RISK_COLORS,
      ragData: undefined,
    },
  });

  const handleSubmit = (data: ConfigSettings) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Configurações</DialogTitle>
          </div>
          <DialogDescription>
            Configure a API e os níveis de risco para a análise.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="api" className="gap-2">
                  <Database className="w-4 h-4" />
                  API
                </TabsTrigger>
                <TabsTrigger value="scales" className="gap-2">
                  <Sliders className="w-4 h-4" />
                  Escalas de Risco
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Cores de Risco
                </TabsTrigger>
                <TabsTrigger value="rag" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  RAG
                </TabsTrigger>
              </TabsList>

              {/* API Tab */}
              <TabsContent value="api" className="space-y-4 mt-4">
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

                {/* URL Field */}
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

                {/* Username Field */}
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

                {/* Password Field */}
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

                {/* AI Key Field */}
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
              </TabsContent>

              {/* Risk Scales Tab */}
              <TabsContent value="scales" className="space-y-4 mt-4">
                <RiskScaleTab form={form} />
              </TabsContent>

              {/* Risk Colors Tab */}
              <TabsContent value="colors" className="space-y-4 mt-4">
                <RiskColorsTab form={form} />
              </TabsContent>

              {/* RAG Tab */}
              <TabsContent value="rag" className="space-y-4 mt-4">
                <RagTab form={form} />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
