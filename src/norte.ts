export type Profile = {
  reason: string
  difficulty: string
  desiredChange: string
  priorities: string[]
  routine: string
  helpStyle: string
  importantContext: string
}

export type AgentDecision = {
  kind: 'ask' | 'suggest' | 'act' | 'wait'
  message: string
}

export const initialProfile: Profile = {
  reason: '',
  difficulty: '',
  desiredChange: '',
  priorities: [],
  routine: '',
  helpStyle: '',
  importantContext: '',
}

export function decideNextAction(profile: Profile): AgentDecision {
  if (!profile.reason || !profile.difficulty || !profile.desiredChange) {
    return {
      kind: 'ask',
      message: 'Quero entender um pouco melhor o que está acontecendo antes de tentar organizar qualquer coisa.',
    }
  }

  if (profile.priorities.length === 0) {
    return {
      kind: 'ask',
      message: 'O que importa mais para você neste momento?',
    }
  }

  return {
    kind: 'suggest',
    message: 'Já tenho um ponto de partida. Agora posso começar a te ajudar a decidir o que faz sentido para hoje — sem tentar colocar tudo no mesmo dia.',
  }
}
