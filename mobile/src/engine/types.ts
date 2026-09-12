export type CapacityLevel = 'high' | 'adequate' | 'reduced' | 'very_reduced'
export type AttentionState = 'available' | 'scattered' | 'focused' | 'possible_hyperfocus'
export type LoadLevel = 'low' | 'moderate' | 'high' | 'overload'
export type ContextKind = 'work' | 'study' | 'home' | 'commute' | 'appointment' | 'rest' | 'unknown'

export type Goal = {
  id: string
  title: string
  importance: number
  horizon: 'short' | 'medium' | 'long'
}

export type Observation = {
  timestamp: string
  source: 'user' | 'calendar' | 'device' | 'activity' | 'system'
  fact: string
  confidence: number
}

export type Hypothesis = {
  id: string
  label: string
  confidence: number
  evidenceCount: number
  lastUpdated: string
}

export type PersonModel = {
  name: string
  communicationPreference: 'voice_first' | 'balanced' | 'text_first'
  interventionPreference: 'gentle' | 'direct' | 'mixed'
  knownStrategies: string[]
  ineffectiveStrategies: string[]
  goals: Goal[]
  hypotheses: Hypothesis[]
}

export type CurrentState = {
  capacity: CapacityLevel
  load: LoadLevel
  attention: AttentionState
  context: ContextKind
  availableMinutes: number | null
  minutesToNextCommitment: number | null
  neglectedNeeds: string[]
  evidence: Observation[]
}

export type InterventionKind = 'silence' | 'signal' | 'orient' | 'guide'

export type AgentDecision = {
  kind: InterventionKind
  reason: string
  nextAction: string | null
  confidence: number
  messageIntent: string | null
}
