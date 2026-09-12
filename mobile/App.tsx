import { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import * as Speech from 'expo-speech'
import { StatusBar } from 'expo-status-bar'
import { decideIntervention } from './src/engine/norteEngine'
import { buildDailyPlan, nextExecutableItem, type Anchor, type PlanItem } from './src/engine/planner'
import type { CapacityLevel, CurrentState, PersonModel } from './src/engine/types'

type Tab = 'today' | 'map' | 'norte'

const person: PersonModel = {
  name: 'Andressa',
  communicationPreference: 'voice_first',
  interventionPreference: 'gentle',
  knownStrategies: ['uma ação por vez', 'pausas reais entre blocos', 'preparar transições'],
  ineffectiveStrategies: ['listas abertas e longas', 'empilhar tarefas sem recuperação'],
  goals: [
    { id: 'study', title: 'Manter a faculdade em andamento', importance: 5, horizon: 'medium' },
    { id: 'work', title: 'Construir trabalho e renda sustentáveis', importance: 5, horizon: 'medium' },
    { id: 'life', title: 'Construir uma vida sustentável', importance: 4, horizon: 'long' },
  ],
  hypotheses: [],
  functionalProfile: {
    initiation: 5,
    decisionMaking: 5,
    transitions: 4,
    predictabilityPreference: 5,
    preferredInput: 'voice',
  },
}

const initialState: CurrentState = {
  capacity: 'reduced',
  load: 'high',
  attention: 'available',
  context: 'home',
  availableMinutes: null,
  minutesToNextCommitment: null,
  neglectedNeeds: [],
  evidence: [],
}

const defaultAnchors: Anchor[] = [
  { id: 'morning', title: 'Manhã e preparação', time: '08:00', durationMinutes: 90, hard: false },
  { id: 'night', title: 'Compromisso fixo', time: '19:00', durationMinutes: 150, hard: true },
]

const priorities = ['Revisar uma pequena parte da faculdade', 'Organizar o próximo passo de trabalho']

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [state, setState] = useState(initialState)
  const [wakeMode, setWakeMode] = useState(false)
  const [completed, setCompleted] = useState<string[]>([])
  const [plan, setPlan] = useState<PlanItem[]>(() => buildDailyPlan(person, initialState, defaultAnchors, priorities))
  const [showCheckin, setShowCheckin] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const decision = useMemo(() => decideIntervention(person, state), [state])
  const next = useMemo(() => nextExecutableItem(plan, completed), [plan, completed])

  const speak = (text: string) => {
    Speech.stop()
    Speech.speak(text, { language: 'pt-BR', rate: 0.92 })
  }

  const startWakeProtocol = () => {
    setWakeMode(true)
    speak('Bom dia, Andressa. Eu estou aqui. Não precisamos resolver o dia inteiro agora. Primeiro, vamos acordar.')
  }

  const confirmUp = () => {
    setWakeMode(false)
    speak('Boa. Agora vamos para o próximo passo: sentar e colocar os pés no chão. Depois eu cuido do restante da manhã com você.')
    setTab('today')
  }

  const updateCapacity = (capacity: CapacityLevel) => {
    const load = capacity === 'very_reduced' ? 'overload' : capacity === 'reduced' ? 'high' : capacity === 'adequate' ? 'moderate' : 'low'
    const nextState = { ...state, capacity, load } as CurrentState
    setState(nextState)
    setPlan(buildDailyPlan(person, nextState, defaultAnchors, priorities))
    setCompleted([])
    setShowCheckin(false)
  }

  const completeNext = () => {
    if (!next) return
    setCompleted((items) => [...items, next.id])
    setFeedback('Feito. O Norte recalculou o próximo movimento.')
    speak(next.kind === 'recovery' ? 'Boa. Agora é recuperação. Você não precisa preencher esse espaço com outra tarefa.' : 'Feito. Eu seguro o mapa. Vamos só para o próximo passo.')
  }

  const regenerate = () => {
    setPlan(buildDailyPlan(person, state, defaultAnchors, priorities))
    setCompleted([])
    setFeedback('Plano adaptado ao estado atual.')
  }

  if (wakeMode) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.wake}>
          <Text style={styles.brand}>Norte</Text>
          <Text style={styles.eyebrow}>Protocolo de despertar</Text>
          <View style={styles.wakeCenter}>
            <Text style={styles.title}>Eu fico aqui com você.</Text>
            <Text style={styles.body}>Não precisamos pensar na vida inteira. Só atravessar o próximo movimento.</Text>
            <Pressable style={styles.primary} onPress={confirmUp}><Text style={styles.primaryText}>Estou acordada</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => speak('Tudo bem. Eu continuo aqui. Quando conseguir, me responde.') }><Text style={styles.secondaryText}>Ainda estou com sono</Text></Pressable>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Norte</Text>
          <Text style={styles.eyebrow}>{tab === 'today' ? 'Hoje' : tab === 'map' ? 'Mapa da vida' : 'Como o Norte pensa'}</Text>
        </View>
        <Pressable style={styles.voiceButton} onPress={() => speak('Estou aqui. O que importa agora é o próximo passo.') }><Text style={styles.voiceText}>◉</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {tab === 'today' && (
          <>
            <View style={styles.greeting}>
              <Text style={styles.titleSmall}>Oi, Andressa.</Text>
              <Text style={styles.body}>Eu tenho o mapa. Você não precisa carregar tudo na cabeça.</Text>
            </View>

            <View style={styles.nextCard}>
              <Text style={styles.label}>PRÓXIMO MOVIMENTO</Text>
              <Text style={styles.nextTitle}>{next?.title ?? 'Você concluiu o que estava no plano.'}</Text>
              {next && <Text style={styles.nextMeta}>{next.kind === 'recovery' ? 'recuperação real' : `${next.durationMinutes} min · sem empilhar outra tarefa`}</Text>}
              {next && <Pressable style={styles.primary} onPress={completeNext}><Text style={styles.primaryText}>{next.kind === 'recovery' ? 'Entrar em recuperação' : 'Começar'}</Text></Pressable>}
              {!next && <Pressable style={styles.secondary} onPress={regenerate}><Text style={styles.secondaryText}>Recalcular o dia</Text></Pressable>}
            </View>

            {feedback && <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>}

            <View style={styles.card}>
              <View style={styles.cardHeader}><Text style={styles.label}>ESTADO ATUAL</Text><Pressable onPress={() => setShowCheckin((value) => !value)}><Text style={styles.link}>ajustar</Text></Pressable></View>
              <Text style={styles.cardTitle}>{state.capacity === 'very_reduced' ? 'Capacidade muito reduzida' : state.capacity === 'reduced' ? 'Capacidade reduzida' : state.capacity === 'adequate' ? 'Capacidade adequada' : 'Boa capacidade'}</Text>
              <Text style={styles.body}>Carga percebida: {state.load === 'overload' ? 'sobrecarga' : state.load === 'high' ? 'alta' : state.load === 'moderate' ? 'moderada' : 'baixa'}.</Text>
              {showCheckin && <View style={styles.chips}>{(['high', 'adequate', 'reduced', 'very_reduced'] as const).map((capacity) => <Pressable key={capacity} style={[styles.chip, state.capacity === capacity && styles.chipSelected]} onPress={() => updateCapacity(capacity)}><Text style={styles.chipText}>{capacity === 'high' ? 'Boa' : capacity === 'adequate' ? 'OK' : capacity === 'reduced' ? 'Reduzida' : 'Muito reduzida'}</Text></Pressable>)}</View>}
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>PLANO ADAPTADO</Text>
              {plan.map((item) => <View key={item.id} style={[styles.planRow, completed.includes(item.id) && styles.doneRow]}><View style={styles.dot} /><View style={styles.planText}><Text style={[styles.planTitle, completed.includes(item.id) && styles.doneText]}>{item.title}</Text><Text style={styles.planMeta}>{item.kind === 'anchor' ? 'compromisso/estrutura' : item.kind === 'recovery' ? 'recuperação' : item.kind === 'optional' ? 'opcional' : `${item.durationMinutes} min`}</Text></View></View>)}
            </View>

            <Pressable style={styles.wakeCard} onPress={startWakeProtocol}><Text style={styles.wakeTitle}>Testar manhã guiada</Text><Text style={styles.wakeBody}>O Norte conduz uma transição por vez.</Text></Pressable>
          </>
        )}

        {tab === 'map' && (
          <>
            <View style={styles.hero}><Text style={styles.title}>O mapa continua inteiro.</Text><Text style={styles.body}>O Norte guarda direção, projetos, compromissos e próximos passos. A tela mostra apenas o que precisa estar diante de você.</Text></View>
            <View style={styles.card}><Text style={styles.label}>DIREÇÕES</Text>{person.goals.map((goal) => <View key={goal.id} style={styles.goal}><Text style={styles.goalTitle}>{goal.title}</Text><Text style={styles.goalMeta}>{goal.horizon === 'long' ? 'longo prazo' : 'em andamento'}</Text></View>)}</View>
            <View style={styles.card}><Text style={styles.label}>REGRAS DO NORTE</Text><Text style={styles.rule}>• não devolver uma lista aberta quando uma decisão pode ser feita</Text><Text style={styles.rule}>• preservar pausas entre demandas</Text><Text style={styles.rule}>• adaptar o caminho sem abandonar o destino</Text><Text style={styles.rule}>• aprender com padrões, não com um único dia</Text></View>
          </>
        )}

        {tab === 'norte' && (
          <>
            <View style={styles.hero}><Text style={styles.title}>Eu não tento definir você.</Text><Text style={styles.body}>Eu observo contexto, capacidade, objetivos e o que funcionou. Quando eu estiver errado, você corrige. Essa correção vira evidência — não uma nova regra permanente.</Text></View>
            <View style={styles.card}><Text style={styles.label}>NÍVEL DE SUPORTE</Text><Text style={styles.cardTitle}>{decision.kind === 'guide' ? 'Guiar de perto' : decision.kind === 'signal' ? 'Sinalizar' : decision.kind === 'orient' ? 'Orientar' : 'Dar espaço'}</Text><Text style={styles.body}>{decision.reason}.</Text>{decision.nextAction && <View style={styles.actionBox}><Text style={styles.actionLabel}>PRÓXIMA AÇÃO</Text><Text style={styles.actionText}>{decision.nextAction}</Text></View>}</View>
            <View style={styles.card}><Text style={styles.label}>COMO APRENDE</Text><Text style={styles.body}>O que você diz → o que acontece → evidência → hipótese → ajuste gradual.</Text><Text style={styles.body}>Preferências não viram verdades. O Norte pode mudar de estratégia quando a realidade mostrar que ela não funciona.</Text></View>
            <Pressable style={styles.primary} onPress={() => speak('Eu seguro o mapa. Você só precisa executar o galho que está diante de você.') }><Text style={styles.primaryText}>Ouvir o Norte</Text></Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.nav}>
        <Pressable onPress={() => setTab('today')} style={styles.navItem}><Text style={[styles.navText, tab === 'today' && styles.navActive]}>Hoje</Text></Pressable>
        <Pressable onPress={() => setTab('map')} style={styles.navItem}><Text style={[styles.navText, tab === 'map' && styles.navActive]}>Mapa</Text></Pressable>
        <Pressable onPress={() => setTab('norte')} style={styles.navItem}><Text style={[styles.navText, tab === 'norte' && styles.navActive]}>Norte</Text></Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F5F0' },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  container: { padding: 22, paddingBottom: 110, gap: 16 },
  brand: { fontSize: 22, fontWeight: '800', color: '#20211F' },
  eyebrow: { marginTop: 3, fontSize: 12, fontWeight: '700', color: '#817E76', textTransform: 'uppercase', letterSpacing: 1.1 },
  voiceButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#20211F', alignItems: 'center', justifyContent: 'center' },
  voiceText: { color: '#FFF', fontSize: 18 },
  greeting: { paddingVertical: 8 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800', color: '#20211F' },
  titleSmall: { fontSize: 28, fontWeight: '800', color: '#20211F', marginBottom: 6 },
  body: { fontSize: 16, lineHeight: 24, color: '#625F58' },
  hero: { paddingVertical: 18, gap: 12 },
  nextCard: { backgroundColor: '#20211F', borderRadius: 24, padding: 22, gap: 12 },
  nextTitle: { color: '#FFF', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  nextMeta: { color: '#D7D4CC', fontSize: 14 },
  label: { fontSize: 11, fontWeight: '800', color: '#8A877F', textTransform: 'uppercase', letterSpacing: 1 },
  nextCard: { backgroundColor: '#20211F', borderRadius: 24, padding: 22, gap: 12 },
  primary: { minHeight: 50, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryText: { color: '#20211F', fontSize: 15, fontWeight: '800' },
  secondary: { minHeight: 50, borderRadius: 15, borderWidth: 1, borderColor: '#D8D5CC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondaryText: { color: '#383733', fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 19, gap: 11 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: '#4D4A44', fontSize: 13, fontWeight: '700' },
  cardTitle: { fontSize: 21, fontWeight: '800', color: '#20211F' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { borderWidth: 1, borderColor: '#D8D5CC', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12 },
  chipSelected: { backgroundColor: '#ECE9E1', borderColor: '#20211F' },
  chipText: { color: '#383733', fontWeight: '700', fontSize: 13 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  doneRow: { opacity: 0.45 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#77736B' },
  planText: { flex: 1 },
  planTitle: { fontSize: 15, fontWeight: '700', color: '#292824' },
  doneText: { textDecorationLine: 'line-through' },
  planMeta: { fontSize: 12, color: '#8A877F', marginTop: 2 },
  wakeCard: { borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#D8D5CC', gap: 5 },
  wakeTitle: { fontSize: 17, fontWeight: '800', color: '#20211F' },
  wakeBody: { fontSize: 14, color: '#6D6961' },
  feedback: { padding: 13, borderRadius: 14, backgroundColor: '#ECE9E1' },
  feedbackText: { color: '#44413A', fontWeight: '700' },
  goal: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#EEECE7' },
  goalTitle: { fontSize: 16, fontWeight: '750', color: '#292824' },
  goalMeta: { marginTop: 3, color: '#8A877F', fontSize: 12 },
  rule: { fontSize: 15, lineHeight: 24, color: '#55524B' },
  actionBox: { marginTop: 3, padding: 14, backgroundColor: '#F2F0EA', borderRadius: 14, gap: 5 },
  actionLabel: { fontSize: 10, fontWeight: '800', color: '#8A877F', letterSpacing: 1 },
  actionText: { fontSize: 16, fontWeight: '800', color: '#292824' },
  wake: { flex: 1, padding: 24 },
  wakeCenter: { flex: 1, justifyContent: 'center', gap: 18, paddingBottom: 70 },
  nav: { position: 'absolute', left: 14, right: 14, bottom: 14, height: 64, borderRadius: 22, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#E7E4DD' },
  navItem: { paddingHorizontal: 24, paddingVertical: 12 },
  navText: { fontSize: 14, fontWeight: '700', color: '#8A877F' },
  navActive: { color: '#20211F' },
})
