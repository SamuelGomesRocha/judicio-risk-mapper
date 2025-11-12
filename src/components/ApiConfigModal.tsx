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
import { Settings } from "lucide-react";

const apiConfigSchema = z.object({
  url: z.string().url({ message: "URL inválida" }).min(1, { message: "URL é obrigatória" }),
  username: z.string().min(1, { message: "Usuário é obrigatório" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
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
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da API</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://api.exemplo.com/webhook" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
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
