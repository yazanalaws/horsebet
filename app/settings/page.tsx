import React from 'react'

export default function page() {
  const deleteMatch = async () => {
       const res = await fetch('/api/match/delete' , {
        method : 'POST'
       })
  }
  return (
    <div className="w-[95%] m-auto flex flex-col mt-[60px]  gap-8 min-h-screen h-auto  text-white text-lg">
       <div>
           <div className='w-full'>

           </div>
       </div>
    </div>
  )
}
