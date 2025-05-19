"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
interface props {
  setNewClient: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function NewClient({ setNewClient }: props) {
  const [name, setName] = useState("");
  const username = Cookies.get("username");
  const createMatch = async () => {
    const res = await fetch("/api/clients/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, username }),
    });
    if (res.ok) {
      const data = await res.json();
      window.location.reload()
      setNewClient(false)
    }
  };

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-[#fffefe8f] flex justify-center items-center ">
      <div className="flex flex-col p-4  gap-4 rounded bg-white text-black w-[100%] max-w-[300px] h-auto ">
        <div className="flex justify-center items-center">
          <p className="text-center font-bold"> إضافة ظريف جديد</p>
          <p onClick={() => setNewClient(false)} className="ml-auto font-bold cursor-pointer">x</p>
        </div>

        <div className="w-full flex flex-col gap-2 justify-end">
          <p className="text-right">اسم الظريف</p>
          <div className="flex justify-end rounded py-0.5 bg-[#f8f8f8] shadow">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="w-full px-0.5 text-right border-none outline-none"
              placeholder=""
            />
          </div>
        </div>
        <button
          onClick={createMatch}
          type="button"
          className="p-0.5 shadow bg-green-600 text-white rounded mb-2"
        >
          أضف الظريف
        </button>
      </div>
    </div>
  );
}
