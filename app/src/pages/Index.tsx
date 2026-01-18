import { useState } from "react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobMatching } from "@/components/JobMatching";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import mascot from "@/assets/mascot.png";
import { toast } from "sonner";

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

  const handleResumeSubmit = (resumeText: string) => {
    setResume(resumeText);
    setResumeVersion((v) => v + 1);
    setAnalysisData(null);
    setSelectedJob(null);
    setStep("matching");
    setIsAdapted(false);
  };

  const handleJobSelect = (job: any, customJob?: string) => {
    setSelectedJob(job || { title: "Vaga Customizada", custom: true, description: customJob });
    setAnalysisData(null);
    setStep("feedback");
    setIsAdapted(false);
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
        const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
        const response = await fetch(`${apiBase}/adapt`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={mascot} alt="Mascote" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Analisador de Currículos
                </h1>
                <p className="text-xs text-muted-foreground">
                  Otimize seu currículo com IA
                </p>
              </div>
            </div>
            {step !== "upload" && (
              <button
                onClick={resetFlow}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                Novo Currículo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 sm:py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
            <div className="flex justify-center mb-6">
              <img
                src={mascot}
                alt="Mascote Analisador"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 drop-shadow-2xl animate-bounce-slow"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Transforme Seu Currículo
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Análise inteligente que compara seu currículo com vagas reais e fornece
              feedback personalizado para aumentar suas chances de contratação
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-8 px-2">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {[
                { id: "upload", label: "Currículo" },
                { id: "matching", label: "Vagas" },
                { id: "feedback", label: "Análise" },
              ].map((item, idx) => (
                <div key={item.id} className="flex items-center min-w-[110px] justify-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                      step === item.id
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground scale-110 shadow-lg"
                        : idx < ["upload", "matching", "feedback"].indexOf(step)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`ml-2 text-xs sm:text-sm font-medium ${
                      step === item.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {idx < 2 && (
                    <div
                      className={`hidden sm:block w-12 md:w-20 h-1 mx-2 rounded-full transition-all ${
                        idx < ["upload", "matching", "feedback"].indexOf(step)
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-6">
            {step === "upload" && (
              <ResumeUpload onResumeSubmit={handleResumeSubmit} />
            )}
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

      {/* Features Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">
              Como Funciona
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Envie Seu Currículo",
                  description: "Cole o texto ou faça upload do arquivo do seu currículo",
                },
                {
                  step: "2",
                  title: "Compare com Vagas",
                  description: "Nossa IA analisa e encontra as vagas mais compatíveis",
                },
                {
                  step: "3",
                  title: "Receba Feedback",
                  description: "Obtenha análise detalhada e adapte seu currículo",
                },
              ].map((feature) => (
                <div
                  key={feature.step}
                  className="text-center p-6 rounded-lg hover:bg-card/50 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl mb-4">
                    {feature.step}
                  </div>
                  <h4 className="font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Analisador de Currículos. Linkedin : https://www.linkedin.com/in/gabriel-victor-71187b223/</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
