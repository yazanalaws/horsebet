import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <div className='fixed h-[50px] w-screen text-white flex p-2 z-2  gap-4 flex-row-reverse items-center bg-[#04071e]'>
      <Link
        className='mr-3'
        href={'/'}
      >
        الرئيسية
      </Link>
     <Link
       href={'/clients'}
     >
       الظريفة
     </Link>
     <Link
       href={'/bets'}
     >
       الرهانات
     </Link>
     <Link
       href={'/match'}
     >
       الحفلة الحالية
     </Link>
     <Link
       href={'/horses'}
     >
       الخيول
     </Link>
     <Link
       href={'/cash'}
     >
       الحسابات
     </Link>

    </div>
  )
}
