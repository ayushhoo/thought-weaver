export type EmotionLevel = 1 | 2 | 3 | 4 | 5;

export type Persona = 'stoic' | 'grandma' | 'detective';

export interface WorryNode {
  id: string;
  text: string;
  isRoot: boolean;
  isNoise: boolean;
  x: number;
  y: number;
}

export interface WorryEdge {
  source: string;
  target: string;
}

export interface WorryGraph {
  nodes: WorryNode[];
  edges: WorryEdge[];
}

export interface Session {
  id: string;
  transcript: string;
  worryGraph: WorryGraph | null;
  emotionBefore: EmotionLevel | null;
  emotionAfter: EmotionLevel | null;
  selectedPersona: Persona | null;
  reframedResponse: string | null;
  createdAt: Date;
}

export type SessionStep = 
  | 'welcome'
  | 'emotion-check'
  | 'brain-dump'
  | 'processing'
  | 'worry-graph'
  | 'persona-select'
  | 'reframe'
  | 'reflection';
