import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  match: number;
  skills: string[];
}

interface JobMatchingProps {
  resume: string;
  onJobSelect: (job: Job | null, customJob?: string) => void;
}

export const JobMatching = ({ resume, onJobSelect }: JobMatchingProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCustomJob, setShowCustomJob] = useState(false);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock job matching - In production, this would call an API
  const searchJobs = () => {
    setIsSearching(true);
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          id: "1",
          title: "Desenvolvedor Full Stack",
          company: "Tech Solutions",
          match: 92,
          skills: ["React", "Node.js", "TypeScript"],
        },
        {
          id: "2",
          title: "Engenheiro de Software",
          company: "Digital Innovations",
          match: 85,
          skills: ["JavaScript", "Python", "AWS"],
        },
        {
          id: "3",
          title: "Front-end Developer",
          company: "Creative Studio",
          match: 78,
          skills: ["React", "CSS", "UI/UX"],
        },
      ];
      setJobs(mockJobs);
      setIsSearching(false);
      toast.success(`${mockJobs.length} vagas compatíveis encontradas!`);
    }, 1500);
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    onJobSelect(job);
    toast.success(`Vaga selecionada: ${job.title}`);
  };

  const handleCustomJobSubmit = () => {
    if (!customJobDescription.trim()) {
      toast.error("Por favor, adicione a descrição da vaga");
      return;
    }
    onJobSelect(null, customJobDescription);
    toast.success("Descrição da vaga recebida!");
  };

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
    <Card className="p-6 md:p-8 shadow-[var(--shadow-card)]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Vagas Compatíveis</h3>
            <p className="text-muted-foreground">{jobs.length} vagas encontradas</p>
          </div>
          <Button
            onClick={() => setShowCustomJob(true)}
            variant="outline"
          >
            Vaga Customizada
          </Button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedJob?.id === job.id
                  ? "border-2 border-primary bg-primary/5"
                  : "border hover:border-primary/50"
              }`}
              onClick={() => handleJobSelect(job)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{job.title}</h4>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
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
                <div className="text-right flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                    <TrendingUp className="w-4 h-4" />
                    {job.match}%
                  </div>
                  {selectedJob?.id === job.id && (
                    <div className="mt-2 flex items-center gap-1 text-primary text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Selecionada
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};
