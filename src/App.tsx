import { useEffect, useState, type MouseEvent } from 'react'
import './App.css'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Ps } from './data/types/ps'
import { usePsDb } from './lib/usePsDb'
import { getResList, resetPsDb } from './lib/psDb'
import { PsEditor } from './components/PsEditor.tsx'
import { ResEditor } from './components/ResEditor.tsx'
import { Toolbar } from './components/Toolbar.tsx'
import { GameBoard } from './components/GameBoard.tsx'
import { PsHint } from './components/PsHint.tsx'

interface Answers {
  [key: string]: Ps[]
}

function App() {
  const { psDb, resList, zonesList, loading, error, setPsDb, setResList } =
    usePsDb()
  const [psList, setPsList] = useState<Record<string, Ps[]>>({
    all: [],
  })
  const [activeElementId, setActiveElementId] = useState<number | null>(null)
  const [activeContainerId, setActiveContainerId] = useState<string | null>(
    null
  )
  const [activePs, setActivePs] = useState<Ps | null>(null)
  const [errorCount, setErrorCount] = useState<number | null>(null)
  const [editorZoneId, setEditorZoneId] = useState<number | null>(null)
  const [resEditorOpen, setResEditorOpen] = useState(false)
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null)
  /** Активная подсказка по ПКМ: название ПС, РЭС и координаты курсора. */
  const [hint, setHint] = useState<{
    psName: string
    resName: string
    x: number
    y: number
  } | null>(null)

  // Зона по умолчанию — первая, в которой есть РЭС (Борисоглебская),
  // иначе самая первая из списка зон.
  useEffect(() => {
    if (activeZoneId !== null || !zonesList.length) return
    const zoneWithRes = zonesList.find((z) =>
      resList.some((r) => r.zoneId === z.id)
    )
    setActiveZoneId((zoneWithRes ?? zonesList[0]).id)
  }, [zonesList, resList, activeZoneId])

  /** РЭС, относящиеся к активной зоне. */
  const zoneRes =
    activeZoneId === null
      ? []
      : resList.filter((r) => r.zoneId === activeZoneId)

  /** Множество id РЭС активной зоны. */
  const zoneResIds = new Set(zoneRes.map((r) => r.id))

  /** Подстанции активной зоны. */
  const zonePs = psDb.filter((ps) => zoneResIds.has(ps.resId))

  // При смене активной зоны (или после загрузки/сброса данных) —
  // пересобираем игровое поле из ПС активной зоны.
  useEffect(() => {
    setPsList({ all: zonePs })
    setErrorCount(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZoneId, psDb, resList])

  /** Возвращает название РЭС по его id (для отображения и ключей контейнеров). */
  const resNameById = (resId: number) =>
    resList.find((r) => r.id === resId)?.name ?? ''

  // answers строится из ПС активной зоны (ключ — название РЭС).
  const answers: Answers = {}
  zonePs.forEach((ps) => {
    const key = resNameById(ps.resId)
    if (!answers[key]) {
      answers[key] = []
    }
    answers[key].push(ps)
  })

  const handleDragStart = ({ active }: DragStartEvent) => {
    const elementId = Number(active.id)
    setActiveElementId(elementId)
    const containerId = findContainer(elementId)
    if (!containerId) return
    setActiveContainerId(containerId)
    const ps = psList[containerId].find((ps) => ps.id === elementId)
    if (!ps) return
    setActivePs(ps)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    // active - перетаскиваемый элемент.
    // over - контейнер, на который перетаскивается активный элемент.
    const { active, over } = e

    if (!over) return

    if (!activeContainerId || !activeElementId) return
    const activeElementPosition = getPsPosition(
      activeElementId,
      activeContainerId
    )

    const overContainerId = over.id.toString()

    if (activeContainerId === overContainerId) {
      setActiveElementId(null)
      setActiveContainerId(null)

      return
    }

    const movedPs = psList[activeContainerId][activeElementPosition]

    if (resNameById(movedPs.resId) !== overContainerId) {
      setErrorCount((prevState) => (prevState ? prevState + 1 : 1))
    }

    // Перемещаем элемент: добавляем в новый контейнер и удаляем из старого за один апдейт.
    setPsList((prevPsList) => ({
      ...prevPsList,
      [overContainerId]: [...(prevPsList[overContainerId] ?? []), movedPs],
      [activeContainerId]: prevPsList[activeContainerId].filter(
        (ps) => ps.id !== active.id
      ),
    }))

    setActiveElementId(null)
    setActiveContainerId(null)
    setActivePs(null)
  }

  const findContainer = (id: number) => {
    return Object.keys(psList).find((key) =>
      psList[key].map((item) => item.id).includes(id)
    )
  }

  /**
   * Получение индекса элемента массива по его id
   * @param id number
   * @param containerId string
   */
  const getPsPosition = (id: number, containerId: string) =>
    psList[containerId].findIndex((ps) => ps.id === id)

  const shuffleArraySimple = (array: Ps[]) =>
    array.slice().sort(() => Math.random() - 0.5)

  const shufflePsSimple = (psDb: Ps[]) => {
    setPsList({
      all: shuffleArraySimple(psDb),
    })
  }

  /** Сбрасывает базу подстанций и таблицу РЭС к исходным данным. */
  const handleResetDb = async () => {
    const fresh = await resetPsDb()
    const freshRes = await getResList()
    setPsDb(fresh)
    setResList(freshRes)
    setErrorCount(null)
  }

  /** Показывает подсказку с названием РЭС по ПКМ на блоке подстанции. */
  const handleShowHint = (ps: Ps, e: MouseEvent) => {
    setHint({
      psName: ps.name,
      resName: resNameById(ps.resId),
      x: e.clientX,
      y: e.clientY,
    })
  }

  /** Открывает редактор подстанций для указанной зоны (по умолчанию — активной). */
  const handleEditPs = (zoneId?: number) => {
    setEditorZoneId(zoneId ?? activeZoneId)
  }

  // Данные редактируемой зоны (может отличаться от активной).
  const editorZone = zonesList.find((z) => z.id === editorZoneId) ?? null
  const editorZoneRes =
    editorZoneId === null
      ? []
      : resList.filter((r) => r.zoneId === editorZoneId)
  const editorZoneResIds = new Set(editorZoneRes.map((r) => r.id))
  const editorZonePs = psDb.filter((ps) => editorZoneResIds.has(ps.resId))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center gap-3 text-2xl font-semibold text-white">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Загрузка подстанций…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-2xl font-semibold text-red-300 shadow-lg">
          Ошибка загрузки: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Toolbar
        zonesList={zonesList}
        activeZoneId={activeZoneId}
        onZoneChange={setActiveZoneId}
        onShuffle={() => {
          shufflePsSimple(zonePs)
          setErrorCount(null)
        }}
        onOrder={() => {
          setPsList({ all: zonePs })
          setErrorCount(null)
        }}
        onFillAnswers={() => {
          setPsList({ ...answers, all: [] })
          setErrorCount(null)
        }}
        onEditPs={handleEditPs}
        onEditRes={() => setResEditorOpen(true)}
        onResetDb={handleResetDb}
        errorCount={errorCount}
        onResetErrors={() => setErrorCount(0)}
      />
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <GameBoard
          zoneRes={zoneRes}
          psList={psList}
          answers={answers}
          activePs={activePs}
          resNameById={resNameById}
          onShowHint={handleShowHint}
        />
      </DndContext>
      {editorZoneId !== null && (
        <PsEditor
          initialList={editorZonePs}
          resList={editorZoneRes}
          zoneName={editorZone?.name ?? ''}
          onSaved={(list) => {
            // Сохраняем только ПС редактируемой зоны, остальные не трогаем.
            const others = psDb.filter((ps) => !editorZoneResIds.has(ps.resId))
            setPsDb([...others, ...list])
            setErrorCount(null)
          }}
          onClose={() => setEditorZoneId(null)}
        />
      )}
      {resEditorOpen && (
        <ResEditor
          initialList={resList}
          zonesList={zonesList}
          onSaved={(list) => {
            setResList(list)
            setErrorCount(null)
          }}
          onClose={() => setResEditorOpen(false)}
        />
      )}
      {hint && (
        <PsHint
          psName={hint.psName}
          resName={hint.resName}
          x={hint.x}
          y={hint.y}
          onClose={() => setHint(null)}
        />
      )}
    </div>
  )
}

export default App
