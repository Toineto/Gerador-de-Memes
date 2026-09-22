export interface CaptionSuggestion {
  id: string;
  topText: string;
  bottomText: string;
  tag: string;
  explanation: string;
}

export interface MemeTemplate {
  id: string;
  name: string;
  category: 'trending' | 'classic' | 'reactions' | 'work_tech' | 'animals';
  url: string;
  width: number;
  height: number;
  defaultTopText?: string;
  defaultBottomText?: string;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // 0 to 1 relative position
  y: number; // 0 to 1 relative position
  fontSize: number; // in px at base 600px width
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontFamily: string;
  isUppercase: boolean;
  align: 'left' | 'center' | 'right';
  hasShadow: boolean;
}

export type MemeStyle = 'classic' | 'modern_banner' | 'bottom_bar';

export interface ImageAnalysisResult {
  visualSummary: string;
  charactersAndMood: string;
  humorBreakdown: string;
  viralityScore: number;
  targetCommunities: string[];
  alternativeAngles: string[];
}

export type HumorVibe =
  | 'balanced'
  | 'work_corporate'
  | 'tech_coding'
  | 'relatable_everyday'
  | 'sarcastic_ironic'
  | 'absurdist_genz'
  | 'wholesome';
