import { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native'
import * as Speech from 'expo-speech'
import { StatusBar } from 'expo-status-bar'
import { decideIntervention } from './src/engine/norteEngine'
import type { CurrentState, PersonModel } from './src/engine/types'

const person: PersonModel = {
  name: 'Andressa',
  communicationPreference: 'voice_first',
  interventionPreference: 'gentle',
  knownStrategies: [],
  ineffectiveStrategies: [],
  goals: [],
  hypotheses: [],
}

const initialState: CurrentState = {
  capacity: 'adequate',
  load: 'moderate',
  attention: 'available',
  context: 'unknown',
  availableMinutes: null,
  minutesToNextCommitment: null,
  neglectedNeeds: [],
  evidence: [],
}

export default function App() {
  const [state, setState] = useState(initialState)
  const [wakeMode, setWakeMode] = useState(false)
  const decision = useMemo(() => decideIntervention(person, state), [state])

  const speak = (text: string) => {
    Speech.stop()
    Speech.speak(text, { language: 'pt-BR', rate: 0.92 })
  }

  const startWakeProtocol = () => {
    setWakeMode(true)
    speak('Bom dia, Andressa. Eu estou aqui. Não precisa pensar no dia inteiro agora. Primeiro, abre os olhos e me responde: você está acordada?')
  }

  const confirmUp = () => {
    setWakeMode(false)
    speak('Boa. Agora vamos só sentar e colocar os pés no chão. Depois a gente decide o resto da manhã juntas.')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>Norte</Text>
        <Text style={styles.eyebrow}>{wakeMode ? 'Protocolo de despertar' : 'Seu copiloto adaptativo'}</Text>

        {wakeMode ? (
          <View style={styles.hero}>
            <Text style={styles.title}>Eu fico aqui com você.</Text>
            <Text style={styles.body}>Não precisamos resolver a manhã agora. Só precisamos atravessar o próximo passo.</Text>
            <Pressable style={styles.primary} onPress={confirmUp}>
              <Text style={styles.primaryText}>Estou acordada</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => speak('Tudo bem. Vou continuar aqui. Quando você conseguir, me responde.') }>
              <Text style={styles.secondaryText}>Ainda estou com muito sono</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <Text style={styles.title}>Vamos descobrir o que cabe agora.</Text>
              <Text style={styles.body}>O Norte não tenta organizar sua vida inteira. Ele observa o contexto, entende sua capacidade e ajuda a encontrar o próximo passo.</Text>
              <Pressable style={styles.primary} onPress={startWakeProtocol}>
                <Text style={styles.primaryText}>Simular despertar</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={() => speak('Estou aqui. Me conta o que está acontecendo.') }>
                <Text style={styles.secondaryText}>Conversar com o Norte</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Decisão atual do cérebro</Text>
              <Text style={styles.cardTitle}>{decision.kind === 'silence' ? 'Ficar em silêncio' : decision.reason}</Text>
              <Text style={styles.body}>{decision.messageIntent ?? decision.reason}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Testar contexto</Text>
              <Text style={styles.body}>Esses controles são apenas para testar o motor antes de conectar calendário, voz, alarmes e sinais do dispositivo.</Text>
              <View style={styles.row}>
                {(['adequate', 'reduced', 'very_reduced'] as const).map((capacity) => (
                  <Pressable key={capacity} style={[styles.chip, state.capacity === capacity && styles.chipSelected]} onPress={() => setState((current) => ({ ...current, capacity }))}>
                    <Text style={styles.chipText}>{capacity === 'adequate' ? 'OK' : capacity === 'reduced' ? 'Baixa' : 'Muito baixa'}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F5F0' },
  container: { padding: 24, gap: 18 },
  brand: { fontSize: 22, fontWeight: '700', color: '#20211F' },
  eyebrow: { fontSize: 13, fontWeight: '600', color: '#77756E', textTransform: 'uppercase', letterSpacing: 1 },
  hero: { paddingVertical: 38, gap: 18 },
  title: { fontSize: 34, lineHeight: 41, fontWeight: '700', color: '#20211F' },
  body: { fontSize: 17, lineHeight: 26, color: '#5F5D57' },
  primary: { minHeight: 52, borderRadius: 16, backgroundColor: '#20211F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondary: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: '#D8D5CC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  secondaryText: { color: '#383733', fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#8A877F', textTransform: 'uppercase', letterSpacing: 0.8 },
  cardTitle: { fontSize: 21, fontWeight: '700', color: '#20211F' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { borderWidth: 1, borderColor: '#D8D5CC', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  chipSelected: { backgroundColor: '#ECE9E1', borderColor: '#20211F' },
  chipText: { color: '#383733', fontWeight: '600' },
})
