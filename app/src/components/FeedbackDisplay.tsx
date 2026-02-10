import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Wand2,
  Download,
  ExternalLink,
  TrendingUp,
  ChevronLeft,
  Sparkles,
  Target,
  Zap,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { MascotAI } from "./MascotAI";

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
  jobScore?: number;
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
  jobScore,
  onAdaptResume,
  onBackToMatching,
  data,
  isAdapting,
  isAdapted,
}: FeedbackDisplayProps) => {
  const fallback: FeedbackData = {
    pontos_fortes: ["Analisando..."],
    pontos_a_melhorar: ["Analisando..."],
    sugestoes: ["Analisando..."],
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

  const getScoreConfig = (score: number) => {
    if (score > 60) return { class: "score-high", label: "Excelente Match", icon: Award };
    if (score > 30) return { class: "score-medium", label: "Bom Match", icon: Target };
    return { class: "score-low", label: "Match a Melhorar", icon: Zap };
  };

  const scoreConfig = jobScore !== undefined ? getScoreConfig(jobScore) : null;

  return (
    <div className="neural-card neural-card-elevated p-5 md:p-8 lg:p-10 animate-in">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName || "Empresa"}
                className="w-16 h-16 rounded-2xl border-2 border-border object-contain bg-white p-1"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-neural flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {companyName?.[0]?.toUpperCase() || "V"}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-2 neural-badge mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Etapa 3 de 3</span>
              </div>
              <p className="text-xl font-bold text-foreground">{companyName || "Empresa"}</p>
              {jobTitle && <p className="text-muted-foreground">{jobTitle}</p>}
            </div>
          </div>

          {onBackToMatching && (
            <Button
              variant="outline"
              onClick={onBackToMatching}
              className="btn-neural-outline"
            >
              <span className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar para vagas
              </span>
            </Button>
          )}
        </div>

        {/* Score Section */}
        {jobScore !== undefined && scoreConfig && (
          <div className="flex flex-col items-center text-center py-6 border-y border-border">
            <MascotAI
              state={jobScore > 60 ? "success" : "idle"}
              size="lg"
              showBubble={false}
            />
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground font-medium">{scoreConfig.label}</p>
              <div className={`score-badge ${scoreConfig.class} text-2xl px-8 py-4`}>
                <TrendingUp className="w-6 h-6" />
                <span>{jobScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compatibilidade com <span className="text-foreground font-medium">{jobTitle}</span>
              </p>
            </div>
          </div>
        )}

        {/* Analysis Title */}
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold font-display">
            Análise <span className="text-gradient">Completa</span>
          </h3>
          <p className="text-muted-foreground mt-2">
            Veja os pontos fortes e oportunidades de melhoria
          </p>
        </div>

        {/* Analysis Grid */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* Strengths */}
          <div className="neural-card p-6 border-2 border-success/20 bg-success/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shadow-glow-sm">
                <CheckCircle2 className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-lg font-display">Pontos Fortes</h4>
                <p className="text-xs text-muted-foreground">O que você tem de melhor</p>
              </div>
            </div>
            <ul className="space-y-3">
              {feedback.pontos_fortes.map((strength, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 animate-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="neural-card p-6 border-2 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-lg font-display">Pontos a Melhorar</h4>
                <p className="text-xs text-muted-foreground">Oportunidades de crescimento</p>
              </div>
            </div>
            <ul className="space-y-3">
              {feedback.pontos_a_melhorar.map((gap, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 animate-in"
                  style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
                >
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestions */}
        <div className="neural-card p-6 border-2 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-glow-sm">
              <Lightbulb className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-lg font-display">Sugestões de Melhoria</h4>
              <p className="text-xs text-muted-foreground">Dicas para aumentar sua compatibilidade</p>
            </div>
          </div>
          <ul className="space-y-4">
            {feedback.sugestoes.map((suggestion, idx) => (
              <li
                key={idx}
                className="flex items-start gap-4 animate-in"
                style={{ animationDelay: `${idx * 0.1 + 0.4}s` }}
              >
                <Badge className="mt-0.5 flex-shrink-0 bg-accent text-accent-foreground font-mono font-bold px-3">
                  {idx + 1}
                </Badge>
                <span className="text-sm text-foreground leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleAdapt}
            disabled={isAdapting || isAdapted}
            size="lg"
            className="btn-neural flex-1 text-base font-semibold group"
          >
            {isAdapting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Adaptando e baixando...
              </span>
            ) : isAdapted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Currículo Adaptado!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Adaptar Currículo para Esta Vaga
                <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </Button>

          {jobUrl && (
            <Button
              onClick={() => window.open(jobUrl, "_blank", "noopener,noreferrer")}
              variant="outline"
              size="lg"
              className="btn-neural-outline"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Ver Vaga
              </span>
            </Button>
          )}

          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="btn-neural-outline"
          >
            <span className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Baixar Análise
            </span>
          </Button>
        </div>

        {/* Pro Tips */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">Dica Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Adaptar seu currículo para cada vaga aumenta em até{" "}
            <span className="text-primary font-semibold">40%</span> suas chances de passar
            pela triagem inicial. Nossa IA gera um currículo otimizado automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};
