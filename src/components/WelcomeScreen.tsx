import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Users } from 'lucide-react';
import heroImage from '@/assets/hero-calm-waves.png';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Mind<span className="text-primary">Vista</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              The Anxiety De-Tangler
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Transform your chaotic thoughts into clarity. Visualize your worries, 
            find your root concern, and gain fresh perspectives.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={onStart} className="shadow-xl">
              Start Brain Dump
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-primary" />}
              title="Brain Dump"
              description="Speak freely for 2 minutes. No interruptions, no judgment."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="Worry Graph"
              description="See your thoughts visualized as an interactive mind map."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Perspective Shift"
              description="Get reframed through the lens of different personas."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-background border border-border">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
