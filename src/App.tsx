import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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

function App() {
  const [count, setCount] = useState(0)
  const [psList, setPsList] = useState<Record<string, Ps[]>>({
    all: psDb,
  })
  const [activeElementId, setActiveElementId] = useState<number | null>(null)
  const [activeContainerId, setActiveContainerId] = useState<string | null>(
    null
  )
  const [activePs, setActivePs] = useState<Ps | null>(null)

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid grid-cols-12 py-3 gap-3">
          <DragOverlay>
            {/*Компонент, который отображается в процессе перемещения.*/}
            {activePs ? <PsItem ps={activePs} /> : null}
          </DragOverlay>
          <div className="col-span-7 grid justify-around text-white gap-2">
            {resList.map((res) => (
              <div
                className="grid grid-cols-12   bg-blue-500 rounded-lg p-3 gap-2"
                key={res.name}
              >
                <div className="flex justify-center items-center rotate-270 px-2 py-3 ">
                  {res.name}
                </div>
                <Droppable
                  id={res.name}
                  className={
                    'col-span-11 p-1 rounded-lg bg-white min-h-[256px]'
                  }
                >
                  <div className="grid grid-cols-4 w-full gap-1  rounded-lg  ">
                    {psList[res.name] &&
                      psList[res.name].map((ps) => (
                        <PsItem key={ps.id} ps={ps} />
                      ))}
                  </div>
                </Droppable>
              </div>
            ))}
          </div>

          <Droppable id={'all'} className={'col-span-5'}>
            <div className=" grid grid-cols-3 gap-2">
              {psList.all.map((ps) => (
                <PsItem key={ps.id} ps={ps} />
              ))}
            </div>
          </Droppable>
        </div>
      </DndContext>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
