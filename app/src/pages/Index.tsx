import { useState } from "react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobMatching } from "@/components/JobMatching";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import mascot from "@/assets/mascot.png";

const Index = () => {
  const [step, setStep] = useState<"upload" | "matching" | "feedback">("upload");
  const [resume, setResume] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const handleResumeSubmit = (resumeText: string) => {
    setResume(resumeText);
    setStep("matching");
  };

  const handleJobSelect = (job: any, customJob?: string) => {
    setSelectedJob(job || { title: "Vaga Customizada", custom: true, description: customJob });
    setStep("feedback");
  };

  const handleAdaptResume = () => {
    // In production, this would trigger the adaptation process
    console.log("Adapting resume for job:", selectedJob);
  };

  const resetFlow = () => {
    setStep("upload");
    setResume("");
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={mascot} alt="Mascote" className="w-12 h-12" />
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
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Novo Currículo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex justify-center mb-6">
              <img
                src={mascot}
                alt="Mascote Analisador"
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-bounce-slow"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Transforme Seu Currículo
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Análise inteligente que compara seu currículo com vagas reais e fornece
              feedback personalizado para aumentar suas chances de contratação
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-4">
              {[
                { id: "upload", label: "Currículo" },
                { id: "matching", label: "Vagas" },
                { id: "feedback", label: "Análise" },
              ].map((item, idx) => (
                <div key={item.id} className="flex items-center">
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
                    className={`ml-2 text-sm font-medium ${
                      step === item.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {idx < 2 && (
                    <div
                      className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all ${
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
          <div className="max-w-4xl mx-auto">
            {step === "upload" && (
              <ResumeUpload onResumeSubmit={handleResumeSubmit} />
            )}
            {step === "matching" && (
              <JobMatching resume={resume} onJobSelect={handleJobSelect} />
            )}
            {step === "feedback" && (
              <FeedbackDisplay
                jobTitle={selectedJob?.title}
                onAdaptResume={handleAdaptResume}
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
          <p>© 2024 Analisador de Currículos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
