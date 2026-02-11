import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Scales Modal Component
 * Displays all risk assessment scales and their definitions
 */
export const ScalesModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const probabilityScales = [
    {
      level: "2",
      grade: "1: MUITO BAIXA",
      description: "Evento extraordinário, sem histórico de ocorrência.",
    },
    {
      level: "4",
      grade: "2: BAIXA",
      description: "Evento casual e inesperado, sem histórico de ocorrência.",
    },
    {
      level: "6",
      grade: "3: MÉDIA",
      description:
        "Evento esperado, de frequência reduzida, e com histórico de ocorrência conhecido pela maioria dos gestores e operadores do processo.",
    },
    {
      level: "8",
      grade: "4: ALTA",
      description: "Evento usual, com histórico de ocorrência amplamente conhecido.",
    },
    {
      level: "10",
      grade: "5: MUITO ALTA",
      description: "Evento repetitivo e constante.",
    },
  ];

  const impactScales = [
    {
      level: "2",
      grade: "1: INSIGNIFICANTE",
      description: "Impacto nulo ou insignificante nos objetivos.",
    },
    {
      level: "4",
      grade: "2: POUCO RELEVANTE",
      description: "Impacto mínimo nos objetivos.",
    },
    {
      level: "6",
      grade: "3: RELEVANTE",
      description:
        "Impacto mediano nos objetivos, com possibilidade de recuperação no caso de consequências negativas.",
    },
    {
      level: "8",
      grade: "4: MUITO RELEVANTE",
      description:
        "Impacto significante nos objetivos, com possibilidade remota de recuperação no caso de consequências negativas.",
    },
    {
      level: "10",
      grade: "5: EXTREMO",
      description:
        "Impacto máximo nos objetivos, sem possibilidade de recuperação no caso de consequências negativas.",
    },
  ];

  const controlFactorScales = [
    {
      level: "INEXISTENTE",
      description:
        "Controles inexistentes, mal desenhados ou mal implementados, isto é, não funcionais",
      factor: "1.0",
    },
    {
      level: "FRACO",
      description:
        "Controles com abordagens aplicadas caso a caso. A responsabilidade é individual, com elevado grau de confiança no conhecimento das pessoas",
      factor: "0.8",
    },
    {
      level: "MEDIANO",
      description:
        "Controles implementados que mitigam alguns aspectos do risco, mas não contemplam todas as perspectivas devido a deficiências no desenho ou nas ferramentas utilizadas",
      factor: "0.6",
    },
    {
      level: "SATISFATÓRIO",
      description:
        "Controles implementados e sustentados por ferramentas adequadas e, embora passíveis de aperfeiçoamento, mitigam satisfatoriamente o risco",
      factor: "0.4",
    },
    {
      level: "FORTE",
      description:
        "Controles implementados que podem ser considerados a 'melhor prática', que mitigam todos os aspectos relevantes do risco",
      factor: "0.2",
    },
  ];

  const riskLevelScales = [
    {
      level: "EXTREMO",
      range: "49 ≤ x ≤ 100",
    },
    {
      level: "ALTO",
      range: "25 ≤ x ≤ 48",
    },
    {
      level: "MÉDIO",
      range: "9 ≤ x ≤ 24",
    },
    {
      level: "BAIXO",
      range: "1 ≤ x ≤ 8",
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Info className="w-4 h-4" />
        Ver Escalas
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Definições de Escalas</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="probability" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="probability">Probabilidade</TabsTrigger>
              <TabsTrigger value="impact">Impacto</TabsTrigger>
              <TabsTrigger value="control">Fator de Controle</TabsTrigger>
              <TabsTrigger value="risk">Nível de Risco</TabsTrigger>
            </TabsList>

            {/* Probability Scale Tab */}
            <TabsContent value="probability" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escala de Probabilidade</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Nível</TableHead>
                        <TableHead className="font-bold">Grau</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {probabilityScales.map((scale, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-center">
                            {scale.level}
                          </TableCell>
                          <TableCell className="font-semibold">{scale.grade}</TableCell>
                          <TableCell>{scale.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Impact Scale Tab */}
            <TabsContent value="impact" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escala de Impacto</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Nível</TableHead>
                        <TableHead className="font-bold">Grau</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {impactScales.map((scale, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-center">
                            {scale.level}
                          </TableCell>
                          <TableCell className="font-semibold">{scale.grade}</TableCell>
                          <TableCell>{scale.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Control Factor Scale Tab */}
            <TabsContent value="control" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escala de Fator de Controle</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Nível</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold text-center">Fator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {controlFactorScales.map((scale, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold whitespace-nowrap">
                            {scale.level}
                          </TableCell>
                          <TableCell>{scale.description}</TableCell>
                          <TableCell className="font-semibold text-center">
                            {scale.factor}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Risk Level Scale Tab */}
            <TabsContent value="risk" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escala de Nível de Risco</h3>
                <p className="text-sm text-muted-foreground">
                  Aplicável a Risco Inerente e Nível de Risco Residual
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Nível de Risco</TableHead>
                        <TableHead className="font-bold">Intervalo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskLevelScales.map((scale, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold">{scale.level}</TableCell>
                          <TableCell className="font-mono">{scale.range}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
