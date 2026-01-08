import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Square } from 'lucide-react';

interface BrainDumpProps {
  onComplete: (transcript: string) => void;
}

export function BrainDump({ onComplete }: BrainDumpProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecording, timeLeft]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    // In a real app, this would transcribe the audio
    // For now, we'll simulate with placeholder text
    const sampleTranscript = "I'm feeling really overwhelmed about my upcoming presentation. I keep thinking about all the ways it could go wrong. What if I forget what to say? What if people think I'm not prepared? And on top of that, I have this deadline at work that I'm not sure I can meet. Everything feels like it's piling up...";
    onComplete(sampleTranscript);
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Brain Dump
        </h2>
        <p className="text-muted-foreground max-w-md">
          Speak freely about what's on your mind. No judgment, no interruptions. 
          Just let it all out.
        </p>
      </div>

      {/* Recording Visualization */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer glow rings */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-breathe" />
            <div className="absolute inset-4 rounded-full bg-primary/20 animate-breathe" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-8 rounded-full bg-primary/30 animate-breathe" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* Main button */}
        <Button
          variant={isRecording ? 'recording' : 'hero'}
          size="iconLg"
          className="w-24 h-24 rounded-full relative z-10"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <Square className="w-8 h-8" />
          ) : hasRecorded ? (
            <Play className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Timer */}
      <div className="text-center">
        <p className={`text-4xl font-mono font-bold ${isRecording ? 'text-primary' : 'text-muted-foreground'}`}>
          {formatTime(timeLeft)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {isRecording ? 'Recording... speak freely' : hasRecorded ? 'Recording complete' : 'Tap to start'}
        </p>
      </div>

      {/* Instructions */}
      {!isRecording && !hasRecorded && (
        <div className="bg-card rounded-lg p-4 max-w-sm text-center border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tips:</strong> Speak about what's worrying you, 
            what you're overthinking, or anything weighing on your mind.
          </p>
        </div>
      )}

      {/* Continue button */}
      {hasRecorded && !isRecording && (
        <Button variant="hero" size="xl" onClick={handleContinue}>
          Analyze My Thoughts
        </Button>
      )}
    </div>
  );
}
