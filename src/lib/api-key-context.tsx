import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type ApiKeyContextType = {
  apiKey: string;
  setApiKey: (key: string) => void;
};

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};

export const useApiKeyValue = () => {
  return useApiKey().apiKey;
};

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_WELD_CONNECT_API_KEY || "",
  );

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
