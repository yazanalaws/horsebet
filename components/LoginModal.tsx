"use client"
import React, { useState } from "react";
import Cookies from "js-cookie";
import { MdClose } from "react-icons/md";
interface Props {
    username : string
    resetLevel: (levelId: number) => Promise<void>
    levelId: number
    setShowLogin: (value: React.SetStateAction<boolean>) => void
}
export default function LoginModal({username , resetLevel , levelId , setShowLogin} : Props) {
  const [password, setPassword] = useState("");
  const login = async () => {
     const res = await fetch('/api/login' , {
        method : "POST",
        headers : {
            "Content-Type" : "application-json"
        },
        body : JSON.stringify({username , password})
     })
     if(res.ok){

         resetLevel(levelId)
         setShowLogin(false)

     }
  };
  return (
    <div className="w-screen fixed top-0 left-0 bg-[#ffffff70] h-screen flex justify-center items-center">
      <form className="flex flex-col p-4  gap-4 rounded bg-white text-black w-[100%] max-w-[300px] h-auto ">
        <div className="w-full flex flex-col gap-2 justify-end">
          <div className="flex justify-end-safe items-center" onClick={() => setShowLogin(false)}><MdClose color="black"  size={24}/> </div>
          <p className="text-right">كلمة السر </p>
          <div className="flex justify-end rounded py-0.5 bg-[#f4f4f4] shadow">
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder="******"
            />
          </div>
        </div>
        <button
          onClick={login}
          type="button"
          className="p-0.5 shadow bg-green-600 text-white rounded mb-2"
        >
          تأكيد إعادة الشوط
        </button>
      </form>
    </div>
  );
}
