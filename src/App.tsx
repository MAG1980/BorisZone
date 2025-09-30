import { useState } from 'react'
import './App.css'
import { psDb } from './data/psDb.ts'
import { resList } from './data/resList.ts'
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

interface Answers {
  [key: string]: Ps[]
}

function App() {
  const [psList, setPsList] = useState<Record<string, Ps[]>>({
    all: psDb,
  })
  const [activeElementId, setActiveElementId] = useState<number | null>(null)
  const [activeContainerId, setActiveContainerId] = useState<string | null>(
    null
  )
  const [activePs, setActivePs] = useState<Ps | null>(null)
  const [errorCount, setErrorCount] = useState<number | null>(null)

  const answers: Answers = {}
  psDb.forEach((ps) => {
    if (!answers[ps.resName]) {
      answers[ps.resName] = []
    }
    answers[ps.resName].push(ps)
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

    if (
      psList[activeContainerId][activeElementPosition].resName !==
      overContainerId
    ) {
      setErrorCount((prevState) => (prevState ? prevState + 1 : 1))
    }

    // Добавляем перетаскиваемый элемент в новый контейнер.
    setPsList((prevPsList) => ({
      ...prevPsList,
      [overContainerId]: !prevPsList[overContainerId]
        ? [psList[activeContainerId][activeElementPosition]]
        : [
            ...prevPsList[overContainerId],
            psList[activeContainerId][activeElementPosition],
          ],
    }))

    // Удаляем перетаскиваемый элемент из контейнера, в котором он находился до перетаскивания.
    const filteredPsList = psList[activeContainerId].filter(
      (ps) => ps.id !== active.id
    )

    setPsList((psList) => ({
      ...psList,
      [activeContainerId]: [...filteredPsList],
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
  const getPsPosition = (id: string | number, containerId: string) =>
    psList[containerId].findIndex((ps) => ps.id === id)

  const shuffleArraySimple = (array: Ps[]) =>
    array.slice().sort(() => Math.random() - 0.5)

  const shufflePsSimple = (psDb: Ps[]) => {
    setPsList({
      all: shuffleArraySimple(psDb),
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <div className="py-3">
      <div className="flex justify-between items-center h-[7vh]">
        <div className="flex gap-52">
          <div className="flex gap-2">
            <button
              className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
              onClick={() => {
                shufflePsSimple(psDb)
                setErrorCount(null)
              }}
            >
              Перемешать
            </button>
            <button
              className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
              onClick={() => {
                setPsList({ all: psDb })
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
                  <p>{activePs.resName}</p>
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
            {resList.map((res) => {
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
                              ps.resName === res.name ? 'success' : 'danger'
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
              'col-span-12 grid-cols-subgrid p-4 bg-blue-800 rounded-lg'
            }
          >
            <div className="grid grid-cols-16 gap-2">
              {psList.all.map((ps) => (
                <PsItem key={ps.id} ps={ps} active={ps.id === activePs?.id} />
              ))}
            </div>
          </Droppable>
        </div>
      </DndContext>
    </div>
  )
}

export default App
