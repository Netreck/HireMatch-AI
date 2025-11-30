import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Briefcase, CheckCircle2, TrendingUp, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  match: number;
  skills: string[]; // all stacks
  languages: string[]; // only languages for list preview
  url?: string;
  companyLogo?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  publishedAt?: string;
  description?: string;
}

interface FeedbackData {
  pontos_fortes: string[];
  pontos_a_melhorar: string[];
  sugestoes: string[];
}

interface JobMatchingProps {
  resume: string;
  onJobSelect: (job: Job | null, customJob?: string) => void;
  onAnalysisComplete?: (job: Job, analysis: FeedbackData) => void;
}

export const JobMatching = ({ resume, onJobSelect, onAnalysisComplete }: JobMatchingProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCustomJob, setShowCustomJob] = useState(false);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mobileDetailRef = useRef<HTMLDivElement | null>(null);
  const JOBS_PER_PAGE = 5;

  const normalizeJob = (apiJob: any): Job => {
    const extractStacks = () => {
      const stacks = apiJob?.tech_stacks_found;
      if (!stacks || typeof stacks !== "object") return [];
      const all = Object.values(stacks).flat().filter(Boolean) as string[];
      return Array.from(new Set(all));
    };

    const extractLanguages = () => {
      const langs = apiJob?.tech_stacks_found?.languages;
      if (!Array.isArray(langs)) return [];
      return Array.from(new Set(langs.filter(Boolean)));
    };

    const techStacks = extractStacks();
    const languages = extractLanguages();
    const score =
      apiJob?.final_score ??
      apiJob?.nota ??
      (typeof apiJob?.similarity === "number"
        ? apiJob.similarity * 100
        : 0);

    const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      id: String(apiJob?.id ?? apiJob?.url ?? fallbackId),
      title: apiJob?.title ?? "Vaga sem título",
      company: apiJob?.company_name ?? "Empresa não informada",
      companyLogo: apiJob?.company_logo ?? apiJob?.company_logo_url,
      match: Math.round(score),
      skills: techStacks.length ? techStacks : ["Sem tecnologias listadas"],
      languages: languages.length ? languages : ["Sem linguagens listadas"],
      url: apiJob?.url,
      salary: apiJob?.salary ?? "Salário não informado",
      location: apiJob?.candidate_required_location ?? "Local não informado",
      jobType: apiJob?.job_type,
      publishedAt: apiJob?.publication_date,
      description:
        (typeof apiJob?.description === "string" && apiJob.description.trim()) ||
        "Descrição não disponível.",
    };
  };

  const searchJobs = async () => {
    if (!resume?.trim()) {
      toast.error("Currículo não encontrado");
      return;
    }

    setIsSearching(true);

    try {
      const apiBase =
        import.meta.env.VITE_API_URL ||
        `${window.location.protocol}//${window.location.hostname}:8000`;
      const response = await fetch(`${apiBase}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ curriculo: resume }),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar vagas no backend");
      }

      const data = await response.json();

      const rawJobs = Array.isArray(data) ? data : data?.jobs || [];
      const formattedJobs = rawJobs
        .map(normalizeJob)
        .sort((a, b) => b.match - a.match);

      setJobs(formattedJobs);
      setCurrentPage(1);
      toast.success(`${formattedJobs.length} vagas compatíveis encontradas!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar vagas");
    } finally {
      setIsSearching(false);
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCustomJobSubmit = () => {
    if (!customJobDescription.trim()) {
      toast.error("Por favor, adicione a descrição da vaga");
      return;
    }
    onJobSelect(null, customJobDescription);
    toast.success("Descrição da vaga recebida!");
  };

  const handleAnalyzeCompatibility = () => {
    if (!selectedJob) {
      toast.error("Selecione uma vaga para analisar");
      return;
    }
    if (!resume?.trim()) {
      toast.error("Currículo não encontrado");
      return;
    }

    const analyze = async () => {
      setIsAnalyzing(true);
      try {
        const apiBase =
          import.meta.env.VITE_API_URL ||
          `${window.location.protocol}//${window.location.hostname}:8000`;
        const response = await fetch(`${apiBase}/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curriculo: resume,
            vaga: selectedJob.description || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao analisar vaga");
        }

        const data = await response.json();
        onAnalysisComplete?.(selectedJob, data);
        toast.success(`Análise pronta para: ${selectedJob.title}`);
      } catch (error) {
        console.error(error);
        toast.error("Falha ao analisar compatibilidade");
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyze();
  };

  const getMatchClasses = (match: number) => {
    if (match > 60) return "bg-emerald-500 text-white";
    if (match > 30) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const pageStart = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = jobs.slice(pageStart, pageStart + JOBS_PER_PAGE);

  useEffect(() => {
    if (selectedJob && mobileDetailRef.current) {
      mobileDetailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedJob]);

  if (jobs.length === 0 && !showCustomJob) {
    return (
      <Card className="p-8 text-center shadow-[var(--shadow-card)]">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Buscar Vagas Compatíveis</h3>
            <p className="text-muted-foreground mb-6">
              Vamos comparar seu currículo com as vagas em nossa base de dados
            </p>
          </div>
          <Button
            onClick={searchJobs}
            disabled={isSearching}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)]"
          >
            {isSearching ? (
              <>Buscando...</>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Buscar Vagas
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowCustomJob(true)}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Ou cole a descrição de uma vaga específica
          </Button>
        </div>
      </Card>
    );
  }

  if (showCustomJob) {
    return (
      <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Descrição da Vaga</h3>
            <p className="text-muted-foreground">
              Cole a descrição completa da vaga que você deseja analisar
            </p>
          </div>
          <Textarea
            placeholder="Cole aqui a descrição da vaga (requisitos, responsabilidades, etc)..."
            value={customJobDescription}
            onChange={(e) => setCustomJobDescription(e.target.value)}
            className="min-h-[250px] resize-none"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleCustomJobSubmit}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)]"
            >
              Analisar Compatibilidade
            </Button>
            <Button
              onClick={() => setShowCustomJob(false)}
              variant="outline"
              size="lg"
            >
              Voltar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5 md:p-6 lg:p-7 shadow-[var(--shadow-card)] max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold leading-tight">Vagas Compatíveis</h3>
            <p className="text-sm text-muted-foreground">{jobs.length} vagas encontradas</p>
          </div>
          <Button
            onClick={() => setShowCustomJob(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Vaga Customizada
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.1fr]">
          <div className="space-y-4">
            {selectedJob && (
              <Card ref={mobileDetailRef} className="p-5 border-dashed border-primary/30 bg-primary/5 lg:hidden">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xl">{selectedJob.title}</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {selectedJob.companyLogo && (
                          <img
                            src={selectedJob.companyLogo}
                            alt={selectedJob.company || "Empresa"}
                            className="w-8 h-8 object-contain rounded bg-white p-0.5 border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <p>{selectedJob.company}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {selectedJob.location && <span className="rounded-full bg-muted px-2 py-1">{selectedJob.location}</span>}
                        {selectedJob.jobType && <span className="rounded-full bg-muted px-2 py-1 capitalize">{selectedJob.jobType.replaceAll("_", " ")}</span>}
                        {selectedJob.salary && <span className="rounded-full bg-muted px-2 py-1">{selectedJob.salary}</span>}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-bold ${getMatchClasses(selectedJob.match)}`}>
                        <TrendingUp className="w-4 h-4" />
                        {selectedJob.match}%
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9"
                        onClick={() => setSelectedJob(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">Descrição da vaga</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto rounded-md bg-card p-3 border border-border/50">
                      {selectedJob.description}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">Tech stacks</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedJob.url && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(selectedJob.url as string, "_blank", "noopener,noreferrer")}
                      >
                        Ver vaga <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    <Button
                      onClick={handleAnalyzeCompatibility}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)] disabled:opacity-70"
                    >
                      {isAnalyzing ? "Analisando..." : "Analisar compatibilidade"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {currentJobs.map((job) => (
              <Card
                key={job.id}
                className={`p-5 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedJob?.id === job.id
                    ? "border-2 border-primary bg-primary/5"
                    : "border hover:border-primary/50"
                }`}
                onClick={() => handleJobSelect(job)}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.company || "Empresa"}
                            className="w-full h-full object-contain bg-white p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Briefcase className="w-6 h-6 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <p className="text-muted-foreground">{job.company}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                          {job.location && <span className="rounded-full bg-muted px-2 py-1">{job.location}</span>}
                          {job.jobType && <span className="rounded-full bg-muted px-2 py-1 capitalize">{job.jobType.replaceAll("_", " ")}</span>}
                          {job.salary && <span className="rounded-full bg-muted px-2 py-1">{job.salary}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.languages.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-secondary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-left lg:text-right flex-shrink-0 space-y-2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getMatchClasses(job.match)}`}>
                      <TrendingUp className="w-4 h-4" />
                      {job.match}%
                    </div>
                    {selectedJob?.id === job.id && (
                      <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Selecionada
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {jobs.length > JOBS_PER_PAGE && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Card className="p-6 border-dashed border-primary/30 bg-primary/5 lg:min-h-[420px] relative hidden lg:block">
            {selectedJob ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xl">{selectedJob.title}</h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {selectedJob.companyLogo && (
                        <img
                          src={selectedJob.companyLogo}
                          alt={selectedJob.company || "Empresa"}
                          className="w-8 h-8 object-contain rounded bg-white p-0.5 border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <p>{selectedJob.company}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {selectedJob.location && <span className="rounded-full bg-muted px-2 py-1">{selectedJob.location}</span>}
                      {selectedJob.jobType && <span className="rounded-full bg-muted px-2 py-1 capitalize">{selectedJob.jobType.replaceAll("_", " ")}</span>}
                      {selectedJob.salary && <span className="rounded-full bg-muted px-2 py-1">{selectedJob.salary}</span>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getMatchClasses(selectedJob.match)}`}>
                      <TrendingUp className="w-4 h-4" />
                      {selectedJob.match}%
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => setSelectedJob(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Descrição da vaga</p>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto rounded-md bg-card p-3 border border-border/50">
                    {selectedJob.description}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Tech stacks</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedJob.url && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(selectedJob.url as string, "_blank", "noopener,noreferrer")}
                    >
                      Ver vaga <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Button
                    onClick={handleAnalyzeCompatibility}
                    disabled={isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)] disabled:opacity-70"
                  >
                    {isAnalyzing ? "Analisando..." : "Analisar compatibilidade"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[240px] space-y-3">
                <Briefcase className="w-10 h-10 text-primary" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Veja os detalhes aqui</p>
                  <p className="text-xs">Selecione uma vaga ao lado para abrir a descrição.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Card>
  );
};
