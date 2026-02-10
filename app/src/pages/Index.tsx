import { useState } from "react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobMatching } from "@/components/JobMatching";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { MascotMini } from "@/components/MascotAI";
import { NeuralBackground } from "@/components/BackgroundEffects";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Briefcase,
  BarChart3,
  Github,
  Linkedin,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [step, setStep] = useState<"upload" | "matching" | "feedback">("upload");
  const [resume, setResume] = useState("");
  const [resumeVersion, setResumeVersion] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [isAdapted, setIsAdapted] = useState(false);
  type AnalysisData = {
    pontos_fortes: string[];
    pontos_a_melhorar: string[];
    sugestoes: string[];
  };
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const getApiBase = () => (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

  const handleResumeSubmit = (resumeText: string) => {
    setResume(resumeText);
    setResumeVersion((v) => v + 1);
    setAnalysisData(null);
    setSelectedJob(null);
    setStep("matching");
    setIsAdapted(false);
  };

  const handleJobSelect = async (job: any, customJob?: string, score?: number) => {
    const jobData = job || {
      title: "Vaga Customizada",
      custom: true,
      description: customJob,
      score: score,
    };
    setSelectedJob(jobData);
    setAnalysisData(null);
    setIsAdapted(false);

    if (!job && customJob) {
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/api/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curriculo: resume,
            vaga: customJob,
          }),
        });

        if (response.ok) {
          const analysisResult = await response.json();
          setAnalysisData(analysisResult);
          setStep("feedback");
        } else {
          toast.error("Erro ao analisar vaga");
        }
      } catch (error) {
        console.error("Erro ao analisar vaga:", error);
        toast.error("Erro ao analisar vaga");
      }
    } else {
      setStep("feedback");
    }
  };

  const handleAnalysisComplete = (job: any, analysis: any) => {
    setSelectedJob(job);
    setAnalysisData(analysis);
    setStep("feedback");
    setIsAdapted(false);
  };

  const handleAdaptResume = () => {
    if (isAdapted) {
      toast.info("Currículo já adaptado para esta vaga");
      return;
    }

    if (!selectedJob?.description || !resume?.trim()) {
      toast.error("Currículo ou vaga não encontrados para adaptação");
      return;
    }

    const doAdapt = async () => {
      setIsAdapting(true);
      toast.info("Gerando currículo adaptado...");
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/api/adapt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curriculo: resume,
            vaga: selectedJob.description,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao adaptar currículo");
        }

        const data = await response.json();
        const texContent = data?.tex as string | undefined;
        const pdfBase64 = data?.pdf_base64 as string | undefined;
        const pdfError = data?.pdf_error as string | undefined;

        if (!texContent) {
          throw new Error("Resposta inválida do adaptador");
        }

        if (pdfBase64) {
          const binary = atob(pdfBase64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i += 1) {
            bytes[i] = binary.charCodeAt(i);
          }
          const pdfBlob = new Blob([bytes], { type: "application/pdf" });
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.download = "curriculo_adaptado.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(pdfUrl);
          toast.success("Currículo adaptado em PDF e download iniciado!");
        } else {
          if (pdfError) {
            toast.info("Não foi possível gerar PDF automaticamente. Baixando .tex.");
          }
          const blob = new Blob([texContent], { type: "application/x-tex;charset=utf-8" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "curriculo_adaptado.tex";
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          toast.success("Currículo adaptado em .tex (PDF indisponível).");
        }

        setIsAdapted(true);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao adaptar currículo");
      } finally {
        setIsAdapting(false);
      }
    };

    return doAdapt();
  };

  const handleBackToMatching = () => {
    setStep("matching");
  };

  const resetFlow = () => {
    setStep("upload");
    setResume("");
    setResumeVersion((v) => v + 1);
    setSelectedJob(null);
    setAnalysisData(null);
    setIsAdapted(false);
    setIsAdapting(false);
  };

  const steps = [
    { id: "upload", label: "Currículo", icon: FileText },
    { id: "matching", label: "Vagas", icon: Briefcase },
    { id: "feedback", label: "Análise", icon: BarChart3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <NeuralBackground showOrbs showParticles />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="glass-card border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3 sm:gap-4">
                <MascotMini className="flex-shrink-0" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-display text-gradient">
                    HireMatch AI
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Inteligência Artificial para sua carreira
                  </p>
                </div>
              </div>

              {/* Actions */}
              {step !== "upload" && (
                <Button
                  onClick={resetFlow}
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary transition-colors group"
                >
                  <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="hidden sm:inline">Novo Currículo</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Hero Title - Only show on upload step */}
            {step === "upload" && (
              <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14 animate-in">
                <div className="inline-flex items-center gap-2 neural-badge mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by AI</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 leading-tight">
                  Transforme Seu{" "}
                  <span className="text-gradient">Currículo</span>
                  <br className="hidden sm:block" />
                  <span className="text-gradient">Com Inteligência Artificial</span>
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Nossa IA analisa seu currículo, encontra vagas compatíveis e gera
                  feedbacks personalizados para aumentar suas chances de contratação
                </p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="max-w-2xl mx-auto mb-8 px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {steps.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = step === item.id;
                  const isComplete = idx < currentStepIndex;

                  return (
                    <div key={item.id} className="flex items-center">
                      {/* Step Circle */}
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div
                          className={`step-indicator ${
                            isActive
                              ? "step-indicator-active"
                              : isComplete
                              ? "step-indicator-complete"
                              : "step-indicator-pending"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            isActive
                              ? "text-primary"
                              : isComplete
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Connector */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`step-connector mx-2 sm:mx-4 ${
                            idx < currentStepIndex ? "step-connector-complete" : ""
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto">
              {step === "upload" && <ResumeUpload onResumeSubmit={handleResumeSubmit} />}

              <div className={step === "matching" ? "" : "hidden"}>
                <JobMatching
                  resume={resume}
                  resumeVersion={resumeVersion}
                  onJobSelect={handleJobSelect}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>

              {step === "feedback" && (
                <FeedbackDisplay
                  jobTitle={selectedJob?.title}
                  companyName={selectedJob?.company}
                  companyLogo={selectedJob?.companyLogo}
                  jobUrl={selectedJob?.url}
                  jobScore={selectedJob?.match ?? selectedJob?.score}
                  onAdaptResume={handleAdaptResume}
                  onBackToMatching={handleBackToMatching}
                  data={analysisData}
                  isAdapting={isAdapting}
                  isAdapted={isAdapted}
                  key={resumeVersion}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section - Only show on upload step */}
        {step === "upload" && (
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-2xl sm:text-3xl font-bold font-display mb-4">
                    Como <span className="text-gradient">Funciona</span>
                  </h3>
                  <p className="text-muted-foreground">
                    Três passos simples para otimizar sua candidatura
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    {
                      step: "01",
                      title: "Envie Seu Currículo",
                      description:
                        "Cole o texto ou faça upload do arquivo. Nossa IA processa PDFs, DOCs e arquivos de texto.",
                      icon: FileText,
                    },
                    {
                      step: "02",
                      title: "Compare com Vagas",
                      description:
                        "Algoritmos de matching encontram as vagas mais compatíveis com seu perfil em tempo real.",
                      icon: Briefcase,
                    },
                    {
                      step: "03",
                      title: "Receba Feedback",
                      description:
                        "Análise detalhada de pontos fortes, melhorias e adaptação automática do currículo.",
                      icon: BarChart3,
                    },
                  ].map((feature, idx) => (
                    <div
                      key={feature.step}
                      className="neural-card p-6 text-center hover-lift animate-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-neural text-primary-foreground mb-5 shadow-glow">
                        <feature.icon className="w-7 h-7" />
                      </div>
                      <div className="font-mono text-xs text-primary mb-2 tracking-wider">
                        PASSO {feature.step}
                      </div>
                      <h4 className="font-bold text-lg font-display mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Section - Only show on upload step */}
        {step === "upload" && (
          <section className="py-12 border-t border-border">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { value: "10K+", label: "Currículos Analisados" },
                    { value: "1000+", label: "Vagas Disponíveis" },
                    { value: "85%", label: "Taxa de Match" },
                    { value: "Real-time", label: "Processamento" },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="animate-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <p className="text-2xl sm:text-3xl font-bold font-mono text-gradient">
                        {stat.value}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-8 border-t border-border glass-card mt-auto">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MascotMini />
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">HireMatch AI</span>
                  <span className="mx-2">·</span>
                  <span>© 2025</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/gabriel-victor-71187b223/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
