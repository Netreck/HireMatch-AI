import { useEffect, useState } from "react";

// Animated background orbs
export const AnimatedOrbs = () => (
  <div className="orb-container">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
  </div>
);

// Grid pattern background
export const GridPattern = () => (
  <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
);

// Dot pattern background
export const DotPattern = () => (
  <div className="fixed inset-0 bg-dot-pattern pointer-events-none z-0" />
);

// Floating particles
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const FloatingParticles = ({ count = 20 }: { count?: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
      });
    }
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Neural network lines effect
export const NeuralLines = () => {
  const [lines, setLines] = useState<{ id: number; x1: number; y1: number; x2: number; y2: number }[]>([]);

  useEffect(() => {
    const generateLines = () => {
      const newLines = [];
      for (let i = 0; i < 8; i++) {
        newLines.push({
          id: i,
          x1: Math.random() * 100,
          y1: Math.random() * 100,
          x2: Math.random() * 100,
          y2: Math.random() * 100,
        });
      }
      setLines(newLines);
    };
    generateLines();
  }, []);

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(142 71% 45%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(172 66% 50%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((line) => (
        <line
          key={line.id}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x2}%`}
          y2={`${line.y2}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          className="animate-pulse"
          style={{ animationDelay: `${line.id * 0.5}s` }}
        />
      ))}
    </svg>
  );
};

// Scanline effect
export const Scanlines = () => (
  <div
    className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
    style={{
      background: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.3) 2px,
        rgba(0, 0, 0, 0.3) 4px
      )`,
    }}
  />
);

// Combined background with all effects
export const NeuralBackground = ({
  showOrbs = true,
  showGrid = false,
  showParticles = true,
  showScanlines = false,
}: {
  showOrbs?: boolean;
  showGrid?: boolean;
  showParticles?: boolean;
  showScanlines?: boolean;
}) => (
  <>
    {showOrbs && <AnimatedOrbs />}
    {showGrid && <GridPattern />}
    {showParticles && <FloatingParticles count={15} />}
    {showScanlines && <Scanlines />}
  </>
);

export default NeuralBackground;
