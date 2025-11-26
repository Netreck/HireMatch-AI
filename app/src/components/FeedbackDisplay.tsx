import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, Wand2, Download } from "lucide-react";
import { toast } from "sonner";

interface FeedbackDisplayProps {
  jobTitle?: string;
  onAdaptResume: () => void;
}

export const FeedbackDisplay = ({ jobTitle, onAdaptResume }: FeedbackDisplayProps) => {
  const [isAdapting, setIsAdapting] = useState(false);

  // Mock feedback data - In production, this would come from API
  const feedback = {
    matchScore: 85,
    strengths: [
      "Experiência sólida em React e TypeScript",
      "Conhecimento em metodologias ágeis",
      "Portfólio diversificado de projetos"
    ],
    gaps: [
      "Falta experiência com testes automatizados",
      "Pouca exposição a arquitetura de microsserviços",
      "Necessário aprofundar conhecimento em CI/CD"
    ],
    suggestions: [
      "Destaque mais seus projetos recentes com React",
      "Adicione métricas de impacto (ex: melhorou performance em 40%)",
      "Inclua certificações relevantes na área",
      "Reorganize seções para destacar habilidades técnicas primeiro"
    ]
  };

  const handleAdapt = () => {
    setIsAdapting(true);
    setTimeout(() => {
      setIsAdapting(false);
      onAdaptResume();
      toast.success("Currículo adaptado com sucesso!");
    }, 2000);
  };

  const handleDownload = () => {
    toast.success("Download iniciado!");
  };

  return (
    <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <span className="text-3xl font-bold text-primary-foreground">
              {feedback.matchScore}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Análise Completa</h3>
          {jobTitle && (
            <p className="text-muted-foreground">
              Compatibilidade com: <span className="font-semibold">{jobTitle}</span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-bold text-lg">Pontos Fortes</h4>
            </div>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Gaps */}
          <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive-foreground" />
              </div>
              <h4 className="font-bold text-lg">Pontos a Melhorar</h4>
            </div>
            <ul className="space-y-3">
              {feedback.gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{gap}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Suggestions */}
        <Card className="p-6 border-2 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
            </div>
            <h4 className="font-bold text-lg">Sugestões de Melhoria</h4>
          </div>
          <ul className="space-y-3">
            {feedback.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Badge className="mt-0.5 flex-shrink-0 bg-accent">
                  {idx + 1}
                </Badge>
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAdapt}
            disabled={isAdapting}
            size="lg"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)]"
          >
            {isAdapting ? (
              <>Adaptando...</>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Adaptar Currículo para Esta Vaga
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="sm:w-auto"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Análise
          </Button>
        </div>
      </div>
    </Card>
  );
};
