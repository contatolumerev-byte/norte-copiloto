import type { CurrentState, PersonModel } from './types'

export type Anchor = { id: string; title: string; time: string; durationMinutes: number; hard: boolean }
export type PlanItem = { id: string; title: string; kind: 'anchor' | 'action' | 'recovery' | 'optional'; durationMinutes: number; note?: string }

const priorityWeight = (importance: number) => Math.max(1, Math.min(5, importance))

export function buildDailyPlan(person: PersonModel, state: CurrentState, anchors: Anchor[], priorities: string[]): PlanItem[] {
  const items: PlanItem[] = []
  const sortedAnchors = [...anchors].sort((a, b) => a.time.localeCompare(b.time))
  sortedAnchors.forEach((anchor) => items.push({ id: anchor.id, title: anchor.title, kind: 'anchor', durationMinutes: anchor.durationMinutes }))

  const capacityFactor = state.capacity === 'very_reduced' ? 0.45 : state.capacity === 'reduced' ? 0.65 : state.capacity === 'adequate' ? 0.85 : 1
  const maxActions = state.load === 'overload' || state.capacity === 'very_reduced' ? 1 : state.capacity === 'reduced' ? 2 : 3
  const goalTitles = person.goals
    .slice()
    .sort((a, b) => priorityWeight(b.importance) - priorityWeight(a.importance))
    .map((goal) => goal.title)
  const candidates = [...priorities, ...goalTitles].filter(Boolean)
  const unique = Array.from(new Set(candidates)).slice(0, maxActions)

  unique.forEach((title, index) => {
    items.push({
      id: `action-${index}`,
      title,
      kind: 'action',
      durationMinutes: Math.max(15, Math.round(30 * capacityFactor)),
      note: state.capacity === 'reduced' || state.capacity === 'very_reduced' ? 'bloco curto; parar antes de esgotar' : undefined,
    })
    if (index < unique.length - 1) items.push({ id: `recovery-${index}`, title: 'Recuperação', kind: 'recovery', durationMinutes: state.capacity === 'very_reduced' ? 30 : 15 })
  })

  if (state.capacity !== 'very_reduced') {
    items.push({ id: 'optional-movement', title: 'Movimento leve', kind: 'optional', durationMinutes: 15, note: 'avaliar disposição antes de fazer' })
  }
  return items
}

export function nextExecutableItem(items: PlanItem[], completed: string[]) {
  return items.find((item) => !completed.includes(item.id) && item.kind !== 'optional') ?? items.find((item) => !completed.includes(item.id)) ?? null
}
