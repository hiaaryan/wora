import React, { createContext, useState, useContext, ReactNode } from "react";

interface PlayerContextType {
  file: string | null;
  setFile: (file: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<string | null>(null);

  return (
    <PlayerContext.Provider value={{ file, setFile }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
