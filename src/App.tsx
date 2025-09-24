import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { psDb } from './data/psDb.ts'
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { PsItem } from './components/PsItem.tsx'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

function App() {
  const [count, setCount] = useState(0)
  const resSet = new Set(psDb.map((ps) => ps.resName))
  const resList = Array.from(resSet)

  const [psList, setPsList] = useState(psDb)

  /**
   * Получение индекса элемента массива по его id
   * @param id number
   */
  const getPsPosition = (id: string | number) =>
    psList.findIndex((ps) => ps.id === id)

  const handleDragEnd = (e: DragEndEvent) => {
    // active - перетаскиваемый элемент.
    // over - элемент, который будет заменён при отпускании активного элемента.
    const { active, over } = e

    // Если позиция перетаскиваемого элемента не изменяется, то ничего не делаем.
    if (!over || active.id === over?.id) return

    setPsList((psList) => {
      // Исходный индекс перетаскиваемого (активного) элемента в массиве.
      const originalPosition = getPsPosition(active.id)
      // Индекс элемента в массиве, на место которого перетаскивается активный элемент.
      const newPosition = getPsPosition(over.id)

      // Используем библиотечную функцию @dnd-kit для изменения положения элемента массива.
      return arrayMove(psList, originalPosition, newPosition)
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
      <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid grid-cols-12 py-3 gap-3">
          <div className="col-span-7 flex flex-col justify-around text-white gap-2">
            {resList.map((resName) => (
              <div
                className="grid grid-cols-12 h-full bg-blue-500 rounded-lg p-3 gap-2"
                key={resName}
              >
                <div className="col-span-3 flex justify-center items-center">
                  {resName}
                </div>
                <div className="col-span-9 h-full flex bg-white rounded-lg"></div>
              </div>
            ))}
          </div>

          <div className="col-span-5 grid grid-cols-3 gap-2">
            <SortableContext
              items={psList}
              strategy={horizontalListSortingStrategy}
            >
              {psList.map((ps) => (
                <PsItem key={ps.id} ps={ps} />
              ))}
            </SortableContext>
          </div>
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
