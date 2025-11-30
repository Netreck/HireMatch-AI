import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

interface FeedbackData {
  pontos_fortes: string[];
  pontos_a_melhorar: string[];
  sugestoes: string[];
}

interface FeedbackDisplayProps {
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  jobUrl?: string;
  onAdaptResume: () => Promise<void> | void;
  onBackToMatching?: () => void;
  data?: FeedbackData;
  isAdapting: boolean;
  isAdapted: boolean;
}

export const FeedbackDisplay = ({
  jobTitle,
  companyName,
  companyLogo,
  jobUrl,
  onAdaptResume,
  onBackToMatching,
  data,
  isAdapting,
  isAdapted,
}: FeedbackDisplayProps) => {
  const fallback: FeedbackData = {
    pontos_fortes: ["Sem dados no momento"],
    pontos_a_melhorar: ["Sem dados no momento"],
    sugestoes: ["Sem dados no momento"],
  };

  const feedback = data ?? fallback;

  const handleAdapt = async () => {
    if (isAdapted) {
      toast.info("Currículo já adaptado para esta vaga");
      return;
    }
    await onAdaptResume();
  };

  const handleDownload = () => {
    toast.success("Download iniciado!");
  };

  return (
    <Card className="p-5 md:p-8 shadow-[var(--shadow-card)]">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName || "Empresa"}
                  className="w-14 h-14 rounded-full border object-contain bg-card"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {companyName?.[0]?.toUpperCase() || "V"}
                </div>
              )}
              <div>
                <p className="text-xs uppercase text-muted-foreground">Empresa</p>
                <p className="text-lg font-bold">{companyName || "Não informada"}</p>
                {jobTitle && <p className="text-sm text-muted-foreground">{jobTitle}</p>}
              </div>
            </div>
            {onBackToMatching && (
              <Button variant="outline" size="sm" onClick={onBackToMatching}>
                Voltar para vagas
              </Button>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Análise Completa</h3>
            {jobTitle && (
              <p className="text-muted-foreground">
                Compatibilidade com: <span className="font-semibold">{jobTitle}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* Strengths */}
          <Card className="p-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h4 className="font-bold text-lg">Pontos Fortes</h4>
            </div>
            <ul className="space-y-3">
              {feedback.pontos_fortes.map((strength, idx) => (
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
              {feedback.pontos_a_melhorar.map((gap, idx) => (
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
            {feedback.sugestoes.map((suggestion, idx) => (
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
            disabled={isAdapting || isAdapted}
            size="lg"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)]"
          >
            {isAdapting ? (
              <>Adaptando e baixando...</>
            ) : isAdapted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Currículo adaptado
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Adaptar Currículo para Esta Vaga
              </>
            )}
          </Button>
          {jobUrl && (
            <Button
              onClick={() => window.open(jobUrl, "_blank", "noopener,noreferrer")}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Ver Vaga
            </Button>
          )}
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
