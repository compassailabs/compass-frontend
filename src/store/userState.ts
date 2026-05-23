"use client";

import { create } from "zustand";

import {
  getAudit,
  getBalance,
  getPolicy,
  getPosition,
  getSession,
  type AuditEvent,
  type BalanceResponse,
  type Policy,
  type Position,
  type SessionStatus,
} from "@/lib/api";

const POLL_MS = 6000;

interface UserStateStore {
  address: string | undefined;
  policy: Policy | null;
  position: Position | null;
  audit: AuditEvent[];
  session: SessionStatus | null;
  balance: BalanceResponse | null;
  setAddress: (addr: string | undefined) => void;
  refresh: () => Promise<void>;
}

let pollIntervalId: number | undefined;
let pollAbortController: AbortController | undefined;

/**
 * Singleton store + polling loop for the per-wallet view of Policy +
 * Position + Audit + Balance + Session. Mounted once via
 * `<UserStatePoller>` in root layout; `AppHeader` (status dot +
 * SmartAccountPill) and Dashboard (full panels) read from it, so
 * there is one fetch path regardless of which route is active.
 */
export const useUserStateStore = create<UserStateStore>((set, get) => ({
  address: undefined,
  policy: null,
  position: null,
  audit: [],
  session: null,
  balance: null,

  refresh: async () => {
    const addr = get().address;
    if (!addr) return;
    pollAbortController?.abort();
    pollAbortController = new AbortController();
    const signal = pollAbortController.signal;

    // Each fetch settles independently so one failing endpoint never
    // wipes the rest of the store. Without this, a 5xx on /audit
    // would block /balance from ever updating the UI.
    const swallow = <T>(p: Promise<T>, fallback: T): Promise<T> =>
      p.catch((err) => {
        if ((err as Error).name !== "AbortError") {
          // Silent on poll errors — toast would spam.
        }
        return fallback;
      });

    const [p, pos, a, s, b] = await Promise.all([
      swallow(getPolicy(addr, signal), get().policy),
      swallow(getPosition(addr, signal), get().position),
      swallow(getAudit(addr, { limit: 25 }, signal), get().audit),
      swallow(getSession(addr, signal), get().session),
      swallow(getBalance(addr, signal), get().balance),
    ]);
    if (signal.aborted) return;
    set({ policy: p, position: pos, audit: a, session: s, balance: b });
  },

  setAddress: (addr) => {
    if (get().address === addr) return;
    set({ address: addr });
    if (pollIntervalId !== undefined) {
      window.clearInterval(pollIntervalId);
      pollIntervalId = undefined;
    }
    pollAbortController?.abort();
    if (!addr) {
      set({
        policy: null,
        position: null,
        audit: [],
        session: null,
        balance: null,
      });
      return;
    }
    void get().refresh();
    pollIntervalId = window.setInterval(() => {
      void get().refresh();
    }, POLL_MS);
  },
}));
