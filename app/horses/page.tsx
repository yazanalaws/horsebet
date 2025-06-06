'use client'

import React, { useEffect, useState } from 'react'
import { MdDelete } from 'react-icons/md'

type Horse = {
  id: number
  name: string
  initial_price: string
  final_price: string
}

type Level = {
  levelId: number
  levelName: string
  status: string
  horses: Horse[]
  firstWinnerId: number | null
  secondWinnerId: number | null
  forcastPrice : string
}

export default function LevelsEditor() {
  const [levelsData, setLevelsData] = useState<Level[]>([])

  useEffect(() => {
    const fetchLevels = async () => {
      const res = await fetch('/api/horses', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setLevelsData(data.levelsData)
      }
    }

    fetchLevels()
  }, [])

  const updateHorse = async (
    levelId: number,
    horseId: number,
    field: 'name' | 'initial_price' | 'final_price',
    value: string
  ) => {
    setLevelsData(prev =>
      prev.map(level =>
        level.levelId === levelId
          ? {
              ...level,
              horses: level.horses.map(horse =>
                horse.id === horseId ? { ...horse, [field]: value } : horse
              ),
            }
          : level
      )
    )

    // Send update to API
    await fetch('/api/horses/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horseId,
        [field]: field === 'name' ? value : value || 0,
      }),
    })
  }

  const removeHorse = async (levelId: number, horseId: number) => {
    const res = await fetch('/api/horses/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horseId , levelId }),
    })

    if (res.ok) {
      setLevelsData(prev =>
        prev.map(level =>
          level.levelId === levelId
            ? {
                ...level,
                horses: level.horses.filter(horse => horse.id !== horseId),
              }
            : level
        )
      )
    }
  }
  const updateForcastPrice = async (levelId : number , forcastPrice : string) => {
    setLevelsData(prev =>
        prev.map(level =>
          level.levelId ===  levelId
          ?{
             ...level,
             forcastPrice : forcastPrice
          } : level
        )
      )

    const res = await fetch('/api/level/update'  , {
      method : 'POST',
       headers: { 'Content-Type': 'application/json' },
       body : JSON.stringify({levelId , forcastPrice})
    })
    if(res.ok){

    }
  }
  return (
    <div className='w-[95%] h-auto flex mt-[100px] min-h-screen pb-2 gap-4 mx-auto flex-row-reverse justify-center flex-wrap'>
      {levelsData.map(level => (
        <div
          key={level.levelId}
          className='w-[260px] bg-white rounded p-3 shadow-sm text-black h-auto flex flex-col'
        >
          <p className='text-sm text-center font-bold mb-2'>{level.levelName}</p>

          {level.horses.map(horse => (
            <div
              key={horse.id}
              className='flex flex-row-reverse gap-2 justify-between items-center mt-2'
            >
              <input
                type='text'
                className='w-[80px] outline-none border shadow text-right px-1'
                placeholder='اسم الحصان'
                value={horse.name}
                onChange={e =>
                  updateHorse(level.levelId, horse.id, 'name', e.target.value)
                }
              />
              <input
                type='text'
                className='w-[60px] outline-none border shadow text-right px-1'
                placeholder='سعر مبدئي'
                value={horse.initial_price}
                onChange={e =>
                  updateHorse(level.levelId, horse.id, 'initial_price', e.target.value)
                }
              />
              <input
                type='text'
                className='w-[60px] outline-none border shadow text-right px-1'
                placeholder='سعر نهائي'
                value={horse.final_price}
                onChange={e =>
                  updateHorse(level.levelId, horse.id, 'final_price', e.target.value)
                }
              />
              <button
                type='button'
                className='p-1 rounded bg-red-600 text-white'
                onClick={() => removeHorse(level.levelId, horse.id)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
          <hr className='mt-2'></hr>
            <div
              className='flex mt-4 flex-row-reverse gap-2 justify-between items-center '
            >
             <p>سعر فوركست</p>
             <input type='number' className='max-w-[100px] shadow' inputMode='decimal' value={level.forcastPrice} onChange={ (e) =>  updateForcastPrice(level.levelId , e.target.value)}/>
            </div>
        </div>
      ))}
    </div>
  )
}
