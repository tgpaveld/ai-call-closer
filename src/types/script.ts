// Script building blocks for visual editor

export interface ScriptVariable {
  key: string;
  label: string;
  defaultValue?: string;
}

export interface ScriptCondition {
  id: string;
  type: 'keyword' | 'sentiment' | 'intent' | 'custom';
  value: string;
  operator: 'contains' | 'equals' | 'not_contains' | 'regex';
}

export interface ScriptTransition {
  id: string;
  label: string;
  condition?: ScriptCondition;
  targetBlockId: string;
}

export interface ScriptBlock {
  id: string;
  type: 'greeting' | 'pitch' | 'question' | 'objection_handler' | 'closing' | 'custom';
  title: string;
  content: string;
  position: { x: number; y: number };
  transitions: ScriptTransition[];
  objectionIds?: string[]; // Link to objection handlers
  isEntryPoint?: boolean;
}

export interface Script {
  id: string;
  name: string;
  description?: string;
  blocks: ScriptBlock[];
  variables: ScriptVariable[];
  isActive: boolean;
  version: number;
  abTestGroup?: 'A' | 'B';
  createdAt: string;
  updatedAt: string;
}

// Objection handling system

export type ObjectionCategory = 
  | 'price' 
  | 'timing' 
  | 'need' 
  | 'trust' 
  | 'competitor' 
  | 'authority' 
  | 'other';

export interface ObjectionResponse {
  id: string;
  text: string;
  tone: 'empathetic' | 'assertive' | 'curious' | 'neutral';
  effectiveness?: number; // 0-100 based on past calls
}

export interface Objection {
  id: string;
  category: ObjectionCategory;
  trigger: string; // What client says
  keywords: string[]; // Keywords to detect this objection
  responses: ObjectionResponse[];
  followUpBlockId?: string; // Where to go after handling
  usageCount: number;
  successRate: number;
  createdAt: string;
}

// A/B Testing

export interface ABTestVariant {
  id: string;
  name: string;
  scriptId: string;
  weight: number; // Percentage of traffic
}

export interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  metrics: {
    variantId: string;
    calls: number;
    conversions: number;
    avgDuration: number;
  }[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
}
