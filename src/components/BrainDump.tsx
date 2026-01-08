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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

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
          disabled={isTranscribing || hasRecorded}
        >
          {isRecording ? (
            <Square className="w-8 h-8" />
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
          {isTranscribing 
            ? 'Transcribing your thoughts...' 
            : isRecording 
              ? 'Recording... speak freely' 
              : hasRecorded 
                ? 'Processing...' 
                : 'Tap to start'}
        </p>
      </div>

      {/* Instructions */}
      {!isRecording && !hasRecorded && !isTranscribing && (
        <div className="bg-card rounded-lg p-4 max-w-sm text-center border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tips:</strong> Speak about what's worrying you, 
            what you're overthinking, or anything weighing on your mind.
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {isTranscribing && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}
