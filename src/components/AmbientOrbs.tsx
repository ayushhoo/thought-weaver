import { useMemo } from 'react';

interface Orb {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  color: 'teal' | 'lavender' | 'peach';
}

export function AmbientOrbs() {
  const orbs = useMemo<Orb[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 200 + 50,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.15 + 0.05,
      color: (['teal', 'lavender', 'peach'] as const)[i % 3],
    }));
  }, []);

  const colorClasses = {
    teal: 'bg-primary/30',
    lavender: 'bg-accent/30',
    peach: 'bg-[hsl(20,80%,70%)]/20',
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-3xl ${colorClasses[orb.color]} animate-float-orb`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            opacity: orb.opacity,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50" />
    </div>
  );
}
