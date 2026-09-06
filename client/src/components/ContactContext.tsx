import { createContext, useContext, useState, type ReactNode } from "react";
import { ContactModal } from "./ContactModal";

interface ContactCtx {
  open: () => void;
  close: () => void;
}

const Ctx = createContext<ContactCtx>({ open: () => {}, close: () => {} });

export function ContactProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <ContactModal open={isOpen} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

export const useContact = () => useContext(Ctx);
