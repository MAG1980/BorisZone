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
import { PsItem } from './components/PsItem.tsx'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Droppable } from './components/Droppable.tsx'
import type { Ps } from './data/types/ps'
import { clsx } from 'clsx'

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

  const answers: Answers = {}
  psDb.forEach((ps) => {
    if (!answers[ps.resName]) {
      answers[ps.resName] = []
    }
    answers[ps.resName].push(ps)
  })

  console.log({ answers })

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

    console.log({ over, active })

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
      setActivePs(null)
      return
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

    const filteredPsList = psList[activeContainerId].filter(
      (ps) => ps.id !== active.id
    )
    // Удаляем перетаскиваемый элемент из списка подстанций.
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
    <>
      <div className="flex gap-2">
        <button
          className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
          onClick={() => shufflePsSimple(psDb)}
        >
          Перемешать
        </button>
        <button
          className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
          onClick={() => setPsList({ all: psDb })}
        >
          Расставить по порядку
        </button>
        <button
          className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
          onClick={() => setPsList({ ...answers, all: [] })}
        >
          Заполнить правильными ответами
        </button>
      </div>
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid grid-cols-12 grid-rows-15 py-3 gap-3 h-[95vh]">
          <DragOverlay>
            {/*Компонент, который отображается в процессе перемещения.*/}
            {activePs ? <PsItem ps={activePs} /> : null}
          </DragOverlay>
          <div className="col-span-12 row-span-6 grid-cols-subgrid grid justify-around text-white gap-2">
            {resList.map((res) => {
              let matches = false
              const currentPsSet = psList[res.name]
              const currentResAnswers = answers[res.name]
              if (currentPsSet) {
                matches =
                  !!currentPsSet.length &&
                  currentPsSet.length === currentResAnswers.length &&
                  currentPsSet.every((ps) => currentResAnswers.includes(ps))
                console.log({ matches })
              }
              console.log({ ps: psList[res.name] })
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
              'col-span-12 row-start-10 row-span-6 grid-cols-subgrid p-4 bg-blue-800 rounded-lg'
            }
          >
            <div className="grid grid-cols-16 gap-2">
              {psList.all.map((ps) => (
                <PsItem key={ps.id} ps={ps} />
              ))}
            </div>
          </Droppable>
        </div>
      </DndContext>
    </>
  )
}

export default App
