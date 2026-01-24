import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { toast } from 'sonner';

interface BrainDumpProps {
  onComplete: (transcript: string) => void;
}

export function BrainDump({ onComplete }: BrainDumpProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
    }
  }, []);

  // Breathing phase toggle (4 seconds each)
  useEffect(() => {
    if (isRecording) {
      breathIntervalRef.current = setInterval(() => {
        setBreathPhase(prev => prev === 'in' ? 'out' : 'in');
      }, 4000);
    }
    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [isRecording]);

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
  }, [isRecording, timeLeft, stopRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await response.json();
      const transcript = data.text || '';
      
      if (!transcript.trim()) {
        toast.error("Couldn't detect any speech. Please try again.");
        setHasRecorded(false);
        setTimeLeft(120);
        return;
      }

      onComplete(transcript);
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio. Please try again.');
      setHasRecorded(false);
      setTimeLeft(120);
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        streamRef.current?.getTracks().forEach(track => track.stop());
        setHasRecorded(true);
        transcribeAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setBreathPhase('in');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Brain Dump
        </h2>
        <p className="text-muted-foreground max-w-md">
          Speak freely about what's on your mind. Let the breathing guide calm you 
          as you release your thoughts.
        </p>
      </div>

      {/* Breathing Recording Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer breathing rings - 4-4 technique */}
        {isRecording && (
          <>
            {/* Outermost ring */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-primary/20 animate-breathe-ring"
              style={{ animationDelay: '0s' }}
            />
            {/* Middle ring */}
            <div 
              className="absolute inset-4 rounded-full border-2 border-primary/30 animate-breathe-ring"
              style={{ animationDelay: '0.5s' }}
            />
            {/* Inner ring */}
            <div 
              className="absolute inset-8 rounded-full border-2 border-primary/40 animate-breathe-ring"
              style={{ animationDelay: '1s' }}
            />
            {/* Glow field */}
            <div 
              className="absolute inset-12 rounded-full bg-primary/10 animate-breathe-4-4"
            />
          </>
        )}
        
        {/* Main button with breathing animation */}
        <Button
          variant={isRecording ? 'recording' : 'hero'}
          size="iconLg"
          className={`
            w-28 h-28 rounded-full relative z-10 transition-all duration-700
            ${isRecording ? 'animate-breathe-4-4 shadow-glow-breathing' : 'shadow-glow hover:shadow-xl'}
          `}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing || hasRecorded}
        >
          {isRecording ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>

        {/* Breathing guide text */}
        {isRecording && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className={`
              text-sm font-medium transition-opacity duration-1000
              ${breathPhase === 'in' ? 'text-primary' : 'text-secondary'}
            `}>
              {breathPhase === 'in' ? 'Breathe in...' : 'Breathe out...'}
            </span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center">
        <p className={`text-4xl font-mono font-bold transition-colors duration-500 ${
          isRecording ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {formatTime(timeLeft)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {isTranscribing 
            ? 'Transcribing your thoughts...' 
            : isRecording 
              ? 'Recording... follow the breath' 
              : hasRecorded 
                ? 'Processing...' 
                : 'Tap to start'}
        </p>
      </div>

      {/* Instructions */}
      {!isRecording && !hasRecorded && !isTranscribing && (
        <div className="glass rounded-2xl p-5 max-w-sm text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tips:</strong> The breathing animation 
            will guide you with a calming 4-second inhale, 4-second exhale rhythm. 
            Speak about what's worrying you.
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {isTranscribing && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}
