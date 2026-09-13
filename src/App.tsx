import { useEffect, useState } from 'react'
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
  const [editorOpen, setEditorOpen] = useState(false)
  const [resEditorOpen, setResEditorOpen] = useState(false)
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null)

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (loading) {
    return <div className="py-3 text-white text-2xl">Загрузка подстанций…</div>
  }

  if (error) {
    return (
      <div className="py-3 text-red-500 text-2xl">
        Ошибка загрузки: {error.message}
      </div>
    )
  }

  return (
    <div className="py-3">
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
        onEditPs={() => setEditorOpen(true)}
        onEditRes={() => setResEditorOpen(true)}
        onResetDb={handleResetDb}
        errorCount={errorCount}
        onResetErrors={() => setErrorCount(0)}
        activePs={activePs}
        activePsResName={activePs ? resNameById(activePs.resId) : ''}
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
        />
      </DndContext>
      {editorOpen && (
        <PsEditor
          initialList={zonePs}
          resList={zoneRes}
          onSaved={(list) => {
            // Сохраняем только ПС активной зоны, остальные не трогаем.
            const others = psDb.filter((ps) => !zoneResIds.has(ps.resId))
            const merged = [...others, ...list]
            setPsDb(merged)
            setPsList({ all: list })
            setErrorCount(null)
          }}
          onClose={() => setEditorOpen(false)}
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
    </div>
  )
}

export default App
