import { useState, useEffect } from "react";
import mascotImg from "@/assets/mascot.png";

type MascotState = "idle" | "thinking" | "analyzing" | "success" | "greeting" | "waiting";

interface MascotAIProps {
  state?: MascotState;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showBubble?: boolean;
  className?: string;
}

const stateMessages: Record<MascotState, string[]> = {
  idle: [
    "Olá! Sou seu assistente de IA",
    "Pronto para analisar seu currículo!",
    "Vamos encontrar a vaga perfeita?",
  ],
  thinking: [
    "Hmm, deixa eu pensar...",
    "Processando informações...",
    "Analisando os dados...",
  ],
  analyzing: [
    "Analisando seu currículo...",
    "Comparando com as vagas...",
    "Identificando compatibilidades...",
  ],
  success: [
    "Encontrei resultados incríveis!",
    "Análise completa com sucesso!",
    "Pronto! Veja os resultados.",
  ],
  greeting: [
    "Bem-vindo ao HireMatch AI!",
    "Que bom ter você aqui!",
    "Vamos começar sua jornada!",
  ],
  waiting: [
    "Aguardando seu currículo...",
    "Cole ou faça upload do CV",
    "Estou pronto quando você estiver!",
  ],
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-36 h-36",
  hero: "w-44 h-44 md:w-56 md:h-56",
};

const animationClasses: Record<MascotState, string> = {
  idle: "mascot-idle",
  thinking: "mascot-thinking",
  analyzing: "mascot-analyzing",
  success: "mascot-success",
  greeting: "mascot-idle",
  waiting: "mascot-idle",
};

export const MascotAI = ({
  state = "idle",
  message,
  size = "md",
  showBubble = false,
  className = "",
}: MascotAIProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      return;
    }

    const messages = stateMessages[state];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage("");
    setIsTyping(true);

    // Typing effect
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < randomMessage.length) {
        setCurrentMessage(randomMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [state, message]);

  return (
    <div className={`mascot-container flex flex-col items-center ${className}`}>
      {/* Glow Effect Background */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-neural rounded-full scale-150" />

        {/* Mascot Image */}
        <img
          src={mascotImg}
          alt="HireMatch AI Assistant"
          className={`
            relative z-10 mascot-glow
            ${sizeClasses[size]}
            ${animationClasses[state]}
            transition-all duration-300
          `}
          draggable={false}
        />

        {/* Particle Effects for analyzing state */}
        {state === "analyzing" && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: "20%",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Success Glow Ring */}
        {state === "success" && (
          <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary animate-ping opacity-50" />
        )}
      </div>

      {/* Speech Bubble */}
      {showBubble && currentMessage && (
        <div className="speech-bubble mt-4 max-w-xs text-center">
          <p className="text-sm text-foreground font-medium">
            {currentMessage}
            {isTyping && <span className="animate-blink ml-0.5">|</span>}
          </p>
        </div>
      )}
    </div>
  );
};

// Mini mascot for headers and small spaces
export const MascotMini = ({ className = "" }: { className?: string }) => (
  <img
    src={mascotImg}
    alt="HireMatch AI"
    className={`w-10 h-10 mascot-glow mascot-idle ${className}`}
    draggable={false}
  />
);

// Loading mascot indicator
export const MascotLoader = ({ text = "Processando..." }: { text?: string }) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <MascotAI state="analyzing" size="lg" />
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
    <p className="text-sm text-muted-foreground font-medium">{text}</p>
  </div>
);

export default MascotAI;
