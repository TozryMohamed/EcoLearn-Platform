// src/constants/levels.js
export const LEVELS = [
  {
    value: '2eme_economie_services',
    label: '2ème année',
    fullLabel: '2ème — Économie & Services',
    specialty: 'Économie & Services',
    emoji: '📘',
  },
  {
    value: '3eme_economie_gestion',
    label: '3ème année',
    fullLabel: '3ème — Économie & Gestion',
    specialty: 'Économie & Gestion',
    emoji: '📗',
  },
  {
    value: '4eme_economie_gestion',
    label: '4ème année',
    fullLabel: '4ème — Économie & Gestion',
    specialty: 'Économie & Gestion',
    emoji: '📕',
  },
]

export const ALL_LEVELS_OPTION = {
  value: 'all',
  label: 'Toutes les spécialités',
  fullLabel: 'Visible par tous les étudiants',
  emoji: '🌍',
}

export const getLevelLabel = (value) => {
  if (value === 'all') return ALL_LEVELS_OPTION.fullLabel
  const lvl = LEVELS.find(l => l.value === value)
  return lvl ? lvl.fullLabel : 'Niveau inconnu'
}

export const getLevelEmoji = (value) => {
  if (value === 'all') return ALL_LEVELS_OPTION.emoji
  const lvl = LEVELS.find(l => l.value === value)
  return lvl ? lvl.emoji : '📚'
}

export const getLevelShort = (value) => {
  if (value === 'all') return 'Toutes'
  const lvl = LEVELS.find(l => l.value === value)
  return lvl ? lvl.label : '?'
}