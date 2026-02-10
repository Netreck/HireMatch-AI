import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Sparkles, ArrowRight, Check, File } from "lucide-react";
import { toast } from "sonner";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { MascotAI } from "./MascotAI";

interface ResumeUploadProps {
  onResumeSubmit: (resume: string) => void;
}

export const ResumeUpload = ({ onResumeSubmit }: ResumeUploadProps) => {
  const [curriculoTexto, setCurriculoTexto] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFileName(file.name);
    try {
      const text = isPdfFile(file)
        ? await extractTextFromPdf(file)
        : await decodeAsUtf8(file);

      if (!text) {
        toast.error("Não foi possível ler o arquivo");
        setFileName(null);
        return;
      }

      setCurriculoTexto(text);
      toast.success("Currículo carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar o arquivo");
      setFileName(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileUpload(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoneClick = () => {
    if (!isParsing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!curriculoTexto.trim()) {
      toast.error("Por favor, adicione seu currículo antes de continuar");
      return;
    }
    onResumeSubmit(curriculoTexto);
    toast.success("Analisando seu currículo...");
  };

  const mascotState = isParsing ? "analyzing" : curriculoTexto ? "success" : "waiting";

  return (
    <div className="neural-card neural-card-elevated p-6 sm:p-8 lg:p-10 animate-in">
      <div className="space-y-8">
        {/* Header with Mascot */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <MascotAI
            state={mascotState}
            size="lg"
            showBubble={!curriculoTexto}
          />
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 neural-badge mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Etapa 1 de 3</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">
              Adicione Seu <span className="text-gradient">Currículo</span>
            </h2>
            <p className="text-muted-foreground max-w-md">
              Nossa IA vai analisar seu perfil e encontrar as melhores oportunidades
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Upload Zone */}
        <div
          onClick={handleZoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`upload-zone cursor-pointer transition-all duration-300 ${
            isDragging ? "upload-zone-active" : ""
          } ${isParsing ? "opacity-70 pointer-events-none" : ""}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleZoneClick();
            }
          }}
        >
          <div className="relative z-10 space-y-4">
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Arquivo carregado</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-neural flex items-center justify-center shadow-glow">
                  <Upload className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground mb-1">
                    Arraste e solte seu arquivo aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou <span className="text-primary font-medium underline underline-offset-2">clique para selecionar</span>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <File className="w-3.5 h-3.5" /> PDF
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span className="flex items-center gap-1.5">
                    <File className="w-3.5 h-3.5" /> DOC
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span className="flex items-center gap-1.5">
                    <File className="w-3.5 h-3.5" /> TXT
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-4 text-muted-foreground font-medium tracking-wider">
              ou cole o texto
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative group">
          <Textarea
            placeholder="Cole o texto do seu currículo aqui..."
            value={curriculoTexto}
            onChange={(e) => {
              setCurriculoTexto(e.target.value);
              if (fileName) setFileName(null);
            }}
            className="neural-input min-h-[180px] resize-none text-sm leading-relaxed
              focus:shadow-glow-sm transition-all duration-300"
          />
          {curriculoTexto && (
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono">
              {curriculoTexto.length.toLocaleString()} caracteres
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={isParsing || !curriculoTexto.trim()}
          className="btn-neural w-full text-base font-semibold group"
        >
          {isParsing ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Lendo arquivo...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Analisar Currículo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {[
            { icon: "🔒", text: "Dados seguros e privados" },
            { icon: "⚡", text: "Análise em tempo real" },
            { icon: "🎯", text: "Match com vagas ideais" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start"
            >
              <span className="text-base">{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
