import { useEffect, useState } from 'react'
import './App.css'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { PsItem } from './components/PsItem.tsx'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Droppable } from './components/Droppable.tsx'
import type { Ps } from './data/types/ps'
import { clsx } from 'clsx'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import { usePsDb } from './lib/usePsDb'
import { getResList, resetPsDb } from './lib/psDb'
import { PsEditor } from './components/PsEditor.tsx'
import { ResEditor } from './components/ResEditor.tsx'

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
      <div className="flex justify-between items-center h-[7vh]">
        <div className="flex gap-4 items-center">
          <select
            className="text-2xl font-bold text-white bg-slate-700 px-4 py-3 rounded"
            value={activeZoneId ?? ''}
            onChange={(e) => setActiveZoneId(Number(e.target.value))}
          >
            {zonesList.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
              onClick={() => {
                shufflePsSimple(zonePs)
                setErrorCount(null)
              }}
            >
              Перемешать
            </button>
            <button
              className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
              onClick={() => {
                setPsList({ all: zonePs })
                setErrorCount(null)
              }}
            >
              Расставить по порядку
            </button>
            <button
              className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
              onClick={() => {
                setPsList({ ...answers, all: [] })
                setErrorCount(null)
              }}
            >
              Заполнить правильными ответами
            </button>
            <button
              className="text-3xl font-bold text-white bg-teal-600 px-4 py-3"
              onClick={() => setEditorOpen(true)}
            >
              Редактировать базу
            </button>
            <button
              className="text-3xl font-bold text-white bg-indigo-600 px-4 py-3"
              onClick={() => setResEditorOpen(true)}
            >
              Редактировать районы
            </button>
            <button
              className="text-3xl font-bold text-white bg-red-600 px-4 py-3"
              onClick={handleResetDb}
            >
              Сбросить базу
            </button>
          </div>
          {!!errorCount && (
            <div className="flex items-center gap-2">
              <div className="text-white font-bold">
                Количество ошибок
                <span className="ml-2 bg-white text-red-500  rounded-full py-4 px-6">
                  {errorCount}
                </span>
              </div>
              <button
                className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
                onClick={() => setErrorCount(0)}
              >
                Сбросить счётчик ошибок
              </button>
            </div>
          )}
        </div>

        <div>
          {activePs && (
            <>
              <Tooltip>
                <TooltipTrigger className="fill-blue-600 text-3xl font-bold text-white bg-teal-600 px-4 py-3">
                  Подсказка для {activePs.name}
                </TooltipTrigger>
                <TooltipContent className="text-xl text-white bg-blue-600 fill-blue-600 px-4 py-3">
                  <p>{resNameById(activePs.resId)}</p>
                  <TooltipArrow className="fill-blue-600" />
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid content-between grid-cols-12 auto-rows-max gap-3 h-[90vh]">
          <DragOverlay>
            {/*Компонент, который отображается в процессе перемещения.*/}
            {activePs ? <PsItem ps={activePs} /> : null}
          </DragOverlay>
          <div className="col-span-12 auto-rows-[minmax(232px,auto)] grid-cols-subgrid grid justify-around text-white gap-2">
            {zoneRes.map((res) => {
              let matches = false
              const currentPsSet = psList[res.name]
              const currentResAnswers = answers[res.name]
              if (currentPsSet) {
                matches =
                  !!currentPsSet.length &&
                  currentPsSet.length === currentResAnswers.length &&
                  currentPsSet.every((ps) => currentResAnswers.includes(ps))
              }
              return (
                <div
                  className={clsx(
                    'col-span-3 flex flex-col bg-blue-500 rounded-lg p-3 gap-2',
                    matches && 'bg-teal-500'
                  )}
                  key={res.name}
                >
                  <div className="flex justify-center items-center px-2 py-3 ">
                    {res.name}
                  </div>
                  <Droppable
                    id={res.name}
                    className={'grow p-1 rounded-lg bg-white'}
                  >
                    <div className="grid grid-cols-4 gap-1  rounded-lg  ">
                      {psList[res.name] &&
                        psList[res.name].map((ps) => (
                          <PsItem
                            key={ps.id}
                            ps={ps}
                            variant={
                              resNameById(ps.resId) === res.name
                                ? 'success'
                                : 'danger'
                            }
                            active={ps.id === activePs?.id}
                          />
                        ))}
                    </div>
                  </Droppable>
                </div>
              )
            })}
          </div>

          <Droppable
            id={'all'}
            className={
              'col-span-12 grid-cols-subgrid p-2 bg-blue-800 rounded-lg'
            }
          >
            <div className="grid grid-cols-16 gap-1">
              {psList.all.map((ps) => (
                <PsItem key={ps.id} ps={ps} active={ps.id === activePs?.id} />
              ))}
            </div>
          </Droppable>
        </div>
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
