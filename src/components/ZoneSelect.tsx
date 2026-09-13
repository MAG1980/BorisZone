import type { ZoneList } from '@/data/types/zone'

interface Props {
  zonesList: ZoneList
  activeZoneId: number | null
  onChange: (zoneId: number) => void
}

/** Выпадающий список выбора активной зоны. */
export const ZoneSelect = ({ zonesList, activeZoneId, onChange }: Props) => {
  return (
    <select
      className="text-2xl font-bold text-white bg-slate-700 px-4 py-3 rounded"
      value={activeZoneId ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {zonesList.map((zone) => (
        <option key={zone.id} value={zone.id}>
          {zone.name}
        </option>
      ))}
    </select>
  )
}
