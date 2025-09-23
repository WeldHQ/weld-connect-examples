import { createContext, useContext } from "react";

import type { AddSourceStreamsResponse } from "./api/add-source-streams";
import type { CreateConnectionBridgeResponse } from "./api/create-connection-bridge";
import type { CreateEltSyncResponse } from "./api/create-elt-sync";

export type SetupStateContextType = {
  integrationId?: string;
  connectionId?: string;
  connectionBridge?: CreateConnectionBridgeResponse;
  eltSync?: CreateEltSyncResponse;
  sourceStreams?: AddSourceStreamsResponse["source_streams"];
};

const context = createContext<SetupStateContextType | null>(null);

export const SetupStateContextProvider = context.Provider;
export const SetupStateContextConsumer = context.Consumer;

export const useSetupState = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error(
      "useSetupState must be used within a SetupStateContextProvider",
    );
  }
  return ctx;
};
