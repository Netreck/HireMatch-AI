import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

interface ResumeUploadProps {
  onResumeSubmit: (resume: string) => void;
}

export const ResumeUpload = ({ onResumeSubmit }: ResumeUploadProps) => {
  const [curriculoTexto, setCurriculoTexto] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const ensurePdfWorker = () => {
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc = pdfjsWorker;
    }
  };

  const extractTextFromPdf = async (file: File) => {
    ensurePdfWorker();
    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: buffer }).promise;
    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      text += strings + "\n";
    }

    return text.trim();
  };

  const decodeAsUtf8 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    return new TextDecoder("utf-8").decode(buffer);
  };

  const isPdfFile = (file: File) => {
    const name = file.name?.toLowerCase() || "";
    return file.type === "application/pdf" || name.endsWith(".pdf");
  };

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    try {
      const text = isPdfFile(file)
        ? await extractTextFromPdf(file)
        : await decodeAsUtf8(file);

      if (!text) {
        toast.error("Não foi possível ler o arquivo");
        return;
      }

      setCurriculoTexto(text);
      toast.success("Currículo carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar o arquivo");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileUpload(file);
  };

  const handleSubmit = () => {
    if (!curriculoTexto.trim()) {
      toast.error("Por favor, adicione seu currículo antes de continuar");
      return;
    }
    onResumeSubmit(curriculoTexto);
    toast.success("Analisando seu currículo...");
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8 shadow-[var(--shadow-card)] border-2 hover:border-primary/50 transition-all duration-300">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Adicione Seu Currículo</h2>
          <p className="text-muted-foreground">
            Cole o texto do seu currículo ou faça upload do arquivo
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50"
          } ${isParsing ? "opacity-70 pointer-events-none" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">
                Arraste e solte seu arquivo aqui
              </p>
              <p className="text-xs text-muted-foreground">
                ou clique para selecionar (PDF, DOC, TXT)
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleFileUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Textarea
          placeholder="Cole o texto do seu currículo aqui..."
          value={curriculoTexto}
          onChange={(e) => setCurriculoTexto(e.target.value)}
          className="min-h-[200px] resize-none"
        />

        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={isParsing}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-button)] transition-all disabled:opacity-70"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isParsing ? "Lendo arquivo..." : "Analisar Currículo"}
        </Button>
      </div>
    </Card>
  );
};
