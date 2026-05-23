"use client";

import { create } from "zustand";

interface UIState {
  sessionModalOpen: boolean;
  openSessionModal: () => void;
  closeSessionModal: () => void;
  fundModalOpen: boolean;
  openFundModal: () => void;
  closeFundModal: () => void;
  withdrawModalOpen: boolean;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  sendToWalletModalOpen: boolean;
  openSendToWalletModal: () => void;
  closeSendToWalletModal: () => void;
  newChatNonce: number;
  requestNewChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sessionModalOpen: false,
  openSessionModal: () => set({ sessionModalOpen: true }),
  closeSessionModal: () => set({ sessionModalOpen: false }),
  fundModalOpen: false,
  openFundModal: () => set({ fundModalOpen: true }),
  closeFundModal: () => set({ fundModalOpen: false }),
  withdrawModalOpen: false,
  openWithdrawModal: () => set({ withdrawModalOpen: true }),
  closeWithdrawModal: () => set({ withdrawModalOpen: false }),
  sendToWalletModalOpen: false,
  openSendToWalletModal: () => set({ sendToWalletModalOpen: true }),
  closeSendToWalletModal: () => set({ sendToWalletModalOpen: false }),
  newChatNonce: 0,
  requestNewChat: () =>
    set((s) => ({ newChatNonce: s.newChatNonce + 1 })),
}));
