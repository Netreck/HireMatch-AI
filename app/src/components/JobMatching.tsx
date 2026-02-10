import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  X,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { MascotAI, MascotLoader } from "./MascotAI";

interface Job {
  id: string;
  title: string;
  company: string;
  match: number;
  skills: string[];
  languages: string[];
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
  resumeVersion: number;
  onJobSelect: (job: Job | null, customJob?: string, score?: number) => void | Promise<void>;
  onAnalysisComplete?: (job: Job, analysis: FeedbackData) => void;
}

export const JobMatching = ({
  resume,
  resumeVersion,
  onJobSelect,
  onAnalysisComplete,
}: JobMatchingProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCustomJob, setShowCustomJob] = useState(false);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const mobileDetailRef = useRef<HTMLDivElement | null>(null);
  const JOBS_PER_PAGE = 5;

  useEffect(() => {
    setSelectedJob(null);
    setJobs([]);
    setCurrentPage(1);
    setShowCustomJob(false);
    setCustomJobDescription("");
  }, [resumeVersion]);

  const getApiBase = () => (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

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
      (typeof apiJob?.similarity === "number" ? apiJob.similarity * 100 : 0);

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
    setSelectedJob(null);
    setJobs([]);

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculo: resume }),
      });

      if (!response.ok) throw new Error("Erro ao buscar vagas no backend");

      const data = await response.json();
      const rawJobs = Array.isArray(data) ? data : data?.jobs || [];
      const formattedJobs = rawJobs.map(normalizeJob).sort((a: Job, b: Job) => b.match - a.match);

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

  const handleCustomJobSubmit = async () => {
    if (!customJobDescription.trim()) {
      toast.error("Por favor, adicione a descrição da vaga");
      return;
    }

    setIsParsing(true);
    try {
      const apiBase = getApiBase();
      const parseResponse = await fetch(`${apiBase}/api/parse-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: customJobDescription, curriculo: resume }),
      });

      if (!parseResponse.ok) throw new Error("Erro ao processar descrição da vaga");

      const parseData = await parseResponse.json();
      await onJobSelect(null, customJobDescription, parseData.score);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar descrição da vaga");
    } finally {
      setIsParsing(false);
    }
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
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/api/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curriculo: resume,
            vaga: selectedJob.description || "",
          }),
        });

        if (!response.ok) throw new Error("Erro ao analisar vaga");

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

  const getScoreConfig = (match: number) => {
    if (match > 60) return { class: "score-high", label: "Excelente", color: "text-green-400" };
    if (match > 30) return { class: "score-medium", label: "Bom", color: "text-amber-400" };
    return { class: "score-low", label: "Baixo", color: "text-red-400" };
  };

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const pageStart = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = jobs.slice(pageStart, pageStart + JOBS_PER_PAGE);

  useEffect(() => {
    if (selectedJob && mobileDetailRef.current) {
      mobileDetailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedJob]);

  // Initial State - Search or Custom Job
  if (jobs.length === 0 && !showCustomJob) {
    if (isSearching) {
      return (
        <div className="neural-card neural-card-elevated p-8 md:p-12 animate-in">
          <MascotLoader text="Buscando vagas compatíveis com seu perfil..." />
        </div>
      );
    }

    return (
      <div className="neural-card neural-card-elevated p-6 sm:p-8 lg:p-10 text-center animate-in">
        <div className="max-w-lg mx-auto space-y-8">
          <MascotAI state="greeting" size="xl" showBubble />

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 neural-badge">
              <Search className="w-3.5 h-3.5" />
              <span>Etapa 2 de 3</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              Buscar <span className="text-gradient">Vagas Compatíveis</span>
            </h3>
            <p className="text-muted-foreground">
              Nossa IA vai comparar seu currículo com milhares de vagas e encontrar as melhores oportunidades
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={searchJobs}
              size="lg"
              className="btn-neural text-base font-semibold group"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar Vagas
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              onClick={() => setShowCustomJob(true)}
              variant="outline"
              size="lg"
              className="btn-neural-outline"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Analisar vaga específica
              </span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            {[
              { value: "1000+", label: "Vagas" },
              { value: "50+", label: "Empresas" },
              { value: "Real-time", label: "Matching" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xl font-bold text-gradient font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Custom Job Input
  if (showCustomJob) {
    return (
      <div className="neural-card neural-card-elevated p-6 md:p-8 animate-in">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MascotAI state={isParsing ? "analyzing" : "waiting"} size="md" />
            <div>
              <h3 className="text-2xl font-bold font-display">
                Descrição da <span className="text-gradient">Vaga</span>
              </h3>
              <p className="text-muted-foreground">
                Cole a descrição completa da vaga que você deseja analisar
              </p>
            </div>
          </div>

          <Textarea
            placeholder="Cole aqui a descrição da vaga (requisitos, responsabilidades, etc)..."
            value={customJobDescription}
            onChange={(e) => setCustomJobDescription(e.target.value)}
            className="neural-input min-h-[250px] resize-none text-sm leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCustomJobSubmit}
              disabled={isParsing || !customJobDescription.trim()}
              size="lg"
              className="btn-neural flex-1 font-semibold"
            >
              {isParsing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analisar Compatibilidade
                </span>
              )}
            </Button>
            <Button
              onClick={() => setShowCustomJob(false)}
              disabled={isParsing}
              variant="outline"
              size="lg"
              className="btn-neural-outline"
            >
              <span>Voltar</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Job List View
  return (
    <div className="neural-card neural-card-elevated p-4 sm:p-6 lg:p-8 animate-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <MascotAI state="success" size="sm" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-display">
                Vagas <span className="text-gradient">Compatíveis</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {jobs.length} vagas encontradas ordenadas por compatibilidade
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCustomJob(true)}
            variant="outline"
            className="btn-neural-outline text-sm"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Vaga Customizada
            </span>
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Job List */}
          <div className="space-y-4">
            {/* Mobile Detail Panel */}
            {selectedJob && (
              <div
                ref={mobileDetailRef}
                className="lg:hidden neural-card neural-card-selected p-5 animate-in"
              >
                <JobDetailPanel
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                  onAnalyze={handleAnalyzeCompatibility}
                  isAnalyzing={isAnalyzing}
                  getScoreConfig={getScoreConfig}
                />
              </div>
            )}

            {/* Job Cards */}
            {currentJobs.map((job, idx) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={() => handleJobSelect(job)}
                getScoreConfig={getScoreConfig}
                delay={idx * 0.05}
              />
            ))}

            {/* Pagination */}
            {jobs.length > JOBS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground font-mono">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="btn-neural-outline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="btn-neural-outline"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Detail Panel */}
          <div className="hidden lg:block sticky top-24">
            <div className="neural-card neural-card-selected min-h-[500px]">
              {selectedJob ? (
                <div className="p-6 animate-in">
                  <JobDetailPanel
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onAnalyze={handleAnalyzeCompatibility}
                    isAnalyzing={isAnalyzing}
                    getScoreConfig={getScoreConfig}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-[500px] p-6">
                  <MascotAI state="idle" size="lg" />
                  <div className="mt-4 space-y-1">
                    <p className="font-semibold text-foreground">Selecione uma vaga</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em uma vaga ao lado para ver os detalhes
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({
  job,
  isSelected,
  onClick,
  getScoreConfig,
  delay,
}: {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
  getScoreConfig: (match: number) => { class: string; label: string; color: string };
  delay: number;
}) => {
  const scoreConfig = getScoreConfig(job.match);

  return (
    <div
      className={`neural-card p-5 cursor-pointer transition-all hover-lift ${
        isSelected ? "neural-card-selected" : ""
      }`}
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            {/* Company Logo */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-neural flex items-center justify-center overflow-hidden">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-contain bg-white p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg text-foreground truncate">{job.title}</h4>
              <p className="text-muted-foreground">{job.company}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 mt-2">
                {job.location && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                )}
                {job.jobType && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {job.jobType.replace(/_/g, " ")}
                  </span>
                )}
                {job.salary && job.salary !== "Salário não informado" && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <DollarSign className="w-3 h-3" />
                    {job.salary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Languages/Skills */}
          <div className="flex flex-wrap gap-2">
            {job.languages.slice(0, 4).map((lang) => (
              <Badge key={lang} className="neural-badge text-xs">
                {lang}
              </Badge>
            ))}
            {job.languages.length > 4 && (
              <Badge className="neural-badge text-xs">+{job.languages.length - 4}</Badge>
            )}
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
          <div className={`score-badge ${scoreConfig.class}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{job.match}%</span>
          </div>
          {isSelected && (
            <span className="flex items-center gap-1 text-primary text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Selecionada
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Job Detail Panel Component
const JobDetailPanel = ({
  job,
  onClose,
  onAnalyze,
  isAnalyzing,
  getScoreConfig,
}: {
  job: Job;
  onClose: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  getScoreConfig: (match: number) => { class: string; label: string; color: string };
}) => {
  const scoreConfig = getScoreConfig(job.match);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xl text-foreground">{job.title}</h4>
            <p className="text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Score */}
      <div className="flex justify-center">
        <div className={`score-badge ${scoreConfig.class} text-lg px-6 py-3`}>
          <TrendingUp className="w-5 h-5" />
          <span>{job.match}% Match</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        {job.location && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
        )}
        {job.jobType && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {job.jobType.replace(/_/g, " ")}
          </span>
        )}
        {job.salary && job.salary !== "Salário não informado" && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <DollarSign className="w-4 h-4" />
            {job.salary}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Descrição da vaga</p>
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto rounded-lg bg-muted/30 p-4 border border-border/50">
          {job.description}
        </div>
      </div>

      {/* Tech Stacks */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Tech Stacks</p>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill} className="neural-badge">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="btn-neural w-full font-semibold"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analisando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Analisar Compatibilidade
            </span>
          )}
        </Button>

        {job.url && (
          <Button
            variant="outline"
            className="btn-neural-outline w-full"
            onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
          >
            <span className="flex items-center gap-2">
              Ver vaga original
              <ExternalLink className="w-4 h-4" />
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
