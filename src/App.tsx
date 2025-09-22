import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { psList } from './data/psList.ts'

function App() {
  const [count, setCount] = useState(0)
  const resSet = new Set(psList.map((ps) => ps.resName))
  const resList = Array.from(resSet)
  console.log({ psList })

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
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
          {psList.map((ps) => (
            <div
              className="flex justify-center items-center bg-cyan-300 text-blue-800 text-pretty p-1 rounded-md"
              key={ps.psName}
            >
              {ps.psName}
            </div>
          ))}
        </div>
      </div>
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
