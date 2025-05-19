"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Cookie from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import Loader from "./loader";
import Navbar from "./Navbar";
import { Toaster } from "./ui/sonner";
interface ClientWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: ClientWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setIsLoading] = useState(true);
  const username = Cookie.get("username");
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      if (pathname !== "/login") {
        router.push("/login");
      }
    } else {
      setLoggedIn(true);
      setIsLoading(false);
    }
  }, [username]);

  return (
    <div className="bg-[#40414e] overflow-hidden">
      {loading ? (
        <Loader />
      ) : (
        <>
          {loggedIn ? (
            <>
              <Navbar />
              {children}
            </>
          ) : (
            <>
            {children}
            </>
          )}
          <Toaster />
        </>
      )}
    </div>
  );
}
