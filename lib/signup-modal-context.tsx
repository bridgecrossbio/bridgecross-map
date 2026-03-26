"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SignupModalContextValue {
  openModal: () => void;
  closeModal: () => void;
}

const SignupModalContext = createContext<SignupModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export function SignupModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SignupModalContext.Provider value={{ openModal: () => setOpen(true), closeModal: () => setOpen(false) }}>
      {children}
      {open && <SignupModalSlot onClose={() => setOpen(false)} />}
    </SignupModalContext.Provider>
  );
}

export const useSignupModal = () => useContext(SignupModalContext);

// Lazy import to avoid circular deps — the actual modal lives in components/
function SignupModalSlot({ onClose }: { onClose: () => void }) {
  const SignupModal = require("@/components/SignupModal").default;
  return <SignupModal onClose={onClose} />;
}
