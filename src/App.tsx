import { useEffect, useMemo, useState } from 'react'
import { decideNextAction, initialProfile, type Profile } from './norte'

const priorities = ['Trabalho', 'Faculdade', 'Saúde', 'Casa', 'Finanças', 'Projetos pessoais', 'Relacionamentos', 'Descanso']

const questions: Array<{ key: keyof Profile; title: string; hint: string }> = [
  { key: 'reason', title: 'O que fez você procurar o Norte?', hint: 'Pode responder do seu jeito. Não precisa formular bonito.' },
  { key: 'difficulty', title: 'O que está mais difícil para você hoje?', hint: 'Pode falar de rotina, atenção, começar, terminar, sobrecarga ou qualquer outra coisa.' },
  { key: 'desiredChange', title: 'O que você gostaria que estivesse diferente daqui a alguns meses?', hint: 'Pense na vida real, não em uma versão perfeita dela.' },
  { key: 'routine', title: 'Como costuma ser um dia normal para você?', hint: 'Queremos entender como sua vida realmente acontece.' },
  { key: 'helpStyle', title: 'Como você gostaria que eu te ajudasse quando as coisas ficarem difíceis?', hint: 'Por exemplo: perguntar antes, sugerir, dividir uma tarefa, reorganizar o dia...' },
  { key: 'importantContext', title: 'Existe alguma coisa sobre você ou sua rotina que é importante eu saber?', hint: 'Esta pergunta é opcional.' },
]

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('norte-profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile() ?? initialProfile)
  const [step, setStep] = useState(() => (loadProfile() ? questions.length : 0))
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(() => loadProfile()?.priorities ?? [])
  const [text, setText] = useState('')

  const completed = step >= questions.length
  const decision = useMemo(() => decideNextAction({ ...profile, priorities: selectedPriorities }), [profile, selectedPriorities])

  useEffect(() => {
    if (completed) localStorage.setItem('norte-profile', JSON.stringify({ ...profile, priorities: selectedPriorities }))
  }, [completed, profile, selectedPriorities])

  const answer = () => {
    const question = questions[step]
    if (!question) return
    setProfile((current) => ({ ...current, [question.key]: text.trim() }))
    setText('')
    setStep((current) => current + 1)
  }

  const togglePriority = (priority: string) => {
    setSelectedPriorities((current) => current.includes(priority) ? current.filter((item) => item !== priority) : [...current, priority].slice(0, 3))
  }

  const reset = () => {
    localStorage.removeItem('norte-profile')
    setProfile(initialProfile)
    setSelectedPriorities([])
    setStep(0)
    setText('')
  }

  if (!completed) {
    const question = questions[step]
    return (
      <main className="page centered">
        <section className="onboarding card">
          <div className="brand">Norte</div>
          <div className="progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
          <p className="eyebrow">Quero te conhecer</p>
          <h1>{question.title}</h1>
          <p className="hint">{question.hint}</p>
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Escreva aqui..." autoFocus />
          <button onClick={answer} disabled={!text.trim() && question.key !== 'importantContext'}>{step === questions.length - 1 ? 'Continuar' : 'Próximo'}</button>
          <p className="quiet">Sem cobrança. O Norte vai conhecendo você aos poucos.</p>
        </section>
      </main>
    )
  }

  if (selectedPriorities.length === 0) {
    return (
      <main className="page centered">
        <section className="onboarding card">
          <div className="brand">Norte</div>
          <p className="eyebrow">Mais uma coisa</p>
          <h1>O que importa mais para você agora?</h1>
          <p className="hint">Escolha até três. Isso não é definitivo; o Norte vai aprender com você.</p>
          <div className="chips">{priorities.map((item) => <button className="chip" key={item} onClick={() => togglePriority(item)}>{item}</button>)}</div>
          <button disabled={selectedPriorities.length === 0} onClick={() => setSelectedPriorities((current) => [...current])}>Começar</button>
        </section>
      </main>
    )
  }

  const savedProfile = { ...profile, priorities: selectedPriorities }

  return (
    <main className="page">
      <header className="topbar"><div className="brand">Norte</div><button className="ghost" onClick={reset}>Refazer diagnóstico</button></header>
      <section className="hero">
        <p className="eyebrow">Seu ponto de partida</p>
        <h1>Vamos descobrir o que faz sentido para hoje.</h1>
        <p className="lead">Eu não vou tentar organizar sua vida inteira. Primeiro, vamos entender o que está acontecendo e escolher o próximo passo.</p>
      </section>
      <section className="grid">
        <article className="card agent"><span className="label">Norte agora</span><p>{decision.message}</p><button onClick={() => alert('Próximo passo: conectar esta decisão ao loop real do agente.')}>Conversar sobre isso</button></article>
        <article className="card"><span className="label">O que importa</span><div className="chips">{savedProfile.priorities.map((item) => <span className="tag" key={item}>{item}</span>)}</div></article>
        <article className="card"><span className="label">O que você quer mudar</span><p>{savedProfile.desiredChange || 'Ainda vamos descobrir.'}</p></article>
        <article className="card"><span className="label">O que está difícil</span><p>{savedProfile.difficulty || 'Ainda vamos descobrir.'}</p></article>
      </section>
      <p className="footer-note">Este é o primeiro retrato. Ele pode mudar conforme o Norte aprende com a vida real.</p>
    </main>
  )
}
