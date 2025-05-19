"use client"
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
export default function page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()
  const login = async () => {
     const res = await fetch('/api/login' , {
        method : "POST",
        headers : {
            "Content-Type" : "application-json"
        },
        body : JSON.stringify({username , password})
     })
     if(res.ok){
        Cookies.set('username' , username)
        router.push('/')

     }
  };
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form className="flex flex-col p-4  gap-4 rounded bg-white text-black w-[100%] max-w-[300px] h-auto ">
        <div className="w-full flex flex-col gap-2 justify-end">
          <p className="text-right">اسم المستخدم</p>
          <div className="flex justify-end rounded py-0.5 bg-[#f8f8f8] shadow">
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder="admin"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 justify-end">
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
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
