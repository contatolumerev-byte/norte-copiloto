import type { AgentDecision, CurrentState, PersonModel } from './types'

const capacityScore: Record<CurrentState['capacity'], number> = { high: 4, adequate: 3, reduced: 2, very_reduced: 1 }
const loadScore: Record<CurrentState['load'], number> = { low: 1, moderate: 2, high: 3, overload: 4 }

export function decideIntervention(person: PersonModel, state: CurrentState): AgentDecision {
  if (state.minutesToNextCommitment !== null && state.minutesToNextCommitment <= 20) {
    return { kind: 'guide', reason: 'compromisso próximo', nextAction: 'começar a preparação para o próximo compromisso', confidence: 0.92, messageIntent: 'reduzir o horizonte ao próximo passo e conduzir a transição' }
  }
  if (state.load === 'overload' || capacityScore[state.capacity] + 1 < loadScore[state.load]) {
    return { kind: 'guide', reason: 'a carga está acima da capacidade disponível', nextAction: 'fazer somente a próxima ação', confidence: 0.9, messageIntent: 'reduzir opções, preservar energia e evitar empilhar demandas' }
  }
  if (state.attention === 'possible_hyperfocus') {
    return { kind: 'signal', reason: 'há evidência de foco prolongado', nextAction: 'pausar e verificar necessidades básicas', confidence: 0.74, messageIntent: 'interromper suavemente sem tratar o foco como problema' }
  }
  if (state.neglectedNeeds.length > 0 && state.capacity !== 'very_reduced') {
    return { kind: 'signal', reason: 'há uma necessidade básica possivelmente negligenciada', nextAction: state.neglectedNeeds[0], confidence: 0.7, messageIntent: 'lembrar sem transformar cuidado em cobrança' }
  }
  if (person.goals.length === 0) {
    return { kind: 'orient', reason: 'o Norte ainda precisa de uma direção', nextAction: null, confidence: 0.95, messageIntent: 'perguntar somente o que muda a próxima decisão' }
  }
  return { kind: 'silence', reason: 'não há evidência suficiente de que uma intervenção agora ajudaria', nextAction: null, confidence: 0.8, messageIntent: null }
}
