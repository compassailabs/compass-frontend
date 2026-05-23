"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";

import { useUserStateStore } from "@/store/userState";

/** Headless: keeps `useUserStateStore` in sync with the connected wallet. */
export function UserStatePoller() {
  const { address } = useAccount();
  const setAddress = useUserStateStore((s) => s.setAddress);
  useEffect(() => {
    setAddress(address);
  }, [address, setAddress]);
  return null;
}
