import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SetupStateContextProvider,
  type SetupStateContextType,
} from "@/lib/setup-state-context";
import { CircleCheck, RotateCcw } from "lucide-react";
import { AddSourceStreamsContainer } from "./steps/add-source-streams";
import { AuthorizeConnectionContainer } from "./steps/authorize-connection";
import { CreateConnectionBridgeContainer } from "./steps/create-connection-bridge";
import { CreateELTSyncContainer } from "./steps/create-elt-sync";
import { EnableDisableSyncContainer } from "./steps/enable-disable-sync";

const steps = [
  {
    title: "Create Connection Bridge",
    component: CreateConnectionBridgeContainer,
    validateProps: (_state: SetupStateContextType) => {
      return true;
    },
    renderHeaderResults: (
      state: SetupStateContextType,
      resetState: () => void,
    ) => {
      return (
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="default"
            onClick={resetState}
            className="h-[22px]"
          >
            <RotateCcw className="!h-[14px] !w-[14px]" />
            Start over
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">
                <span className="font-mono">{state.connectionBridge?.id}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Connection Bridge ID</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: "Authorize Connection",
    component: AuthorizeConnectionContainer,
    validateProps: (
      state: SetupStateContextType,
    ): state is SetupStateContextType & {
      connectionBridge: NonNullable<SetupStateContextType["connectionBridge"]>;
    } => {
      return !!state.connectionBridge;
    },
    renderHeaderResults: (state: SetupStateContextType) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline">
              <span className="font-mono">{state.connectionId}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Connection ID</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    title: "Create ELT Sync",
    component: CreateELTSyncContainer,
    validateProps: (
      state: SetupStateContextType,
    ): state is SetupStateContextType & {
      connectionId: NonNullable<SetupStateContextType["connectionId"]>;
    } => {
      return !!state.connectionId;
    },
    renderHeaderResults: (state: SetupStateContextType) => {
      if (!state.eltSync) return null;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline">
              <span className="font-mono">{state.eltSync.id}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>ELT Sync ID</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    title: "Add Streams (Tables) to Sync",
    component: AddSourceStreamsContainer,
    validateProps: (
      state: SetupStateContextType,
    ): state is SetupStateContextType & {
      eltSync: NonNullable<SetupStateContextType["eltSync"]>;
    } => {
      return !!state.eltSync;
    },
    renderHeaderResults: (state: SetupStateContextType) => {
      if (!state.sourceStreams) return null;
      return (
        <HoverCard openDelay={100}>
          <HoverCardTrigger asChild>
            <Badge variant="outline">
              <strong>{state.sourceStreams.length}</strong> streams
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent>
            <ul className="space-y-0.5 text-sm">
              {state.sourceStreams.map((stream) => {
                return <li key={stream.name}>{stream.name}</li>;
              })}
            </ul>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    title: "Start the Sync",
    component: EnableDisableSyncContainer,
    validateProps: (
      state: SetupStateContextType,
    ): state is SetupStateContextType & {
      sourceStreams: NonNullable<SetupStateContextType["sourceStreams"]>;
      eltSync: NonNullable<SetupStateContextType["eltSync"]>;
    } => {
      return !!state.sourceStreams && !!state.eltSync;
    },
  },
] as const;

const stateReset = (): SetupStateContextType => ({
  connectionId: import.meta.env.VITE_WELD_CONNECTION_ID || undefined,
});

import { useEffect, useRef } from "react";

export function CreateEltSyncFlowContainer() {
  const [state, setState] = useState<SetupStateContextType>(() => stateReset());
  const [currentIndex, setCurrentIndex] = useState(() => {
    const startIndex = steps
      .slice()
      .reverse()
      .findIndex((step) => {
        return step.validateProps(state);
      });
    return startIndex === -1 ? 0 : startIndex;
  });
  console.log({ currentIndex, state });

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to the active step when currentIndex changes
  useEffect(() => {
    const ref = stepRefs.current[currentIndex];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentIndex]);

  const setStatePartial = (partial: Partial<SetupStateContextType>) => {
    setState((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const nextStep = () => {
    setCurrentIndex((prev) =>
      Math.max(0, Math.min(prev + 1, steps.length - 1)),
    );
  };

  const resetState = () => {
    setState(stateReset());
    setCurrentIndex(0);
  };

  return (
    <SetupStateContextProvider value={state}>
      <div className="px-6 md:px-12 py-8 space-y-12 mx-auto max-w-4xl">
        <div className="text-sm text-muted-foreground px-8">
          Follow the steps below to create and start an ELT sync with the Weld
          Connect API. Make sure to create an API key in your Weld account and
          paste it in above.
        </div>
        {steps.map((step, index) => {
          return (
            <div
              key={step.title}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className={cn({
                "border-b": index !== currentIndex,
              })}
            >
              <div className="flex items-center justify-between pb-2">
                <h2
                  className={cn("font-medium text-lg truncate shrink pl-2", {
                    "opacity-50": currentIndex !== index,
                  })}
                >
                  {index + 1}. {step.title}
                </h2>
                {currentIndex > index && (
                  <div className="ml-auto flex items-center gap-4">
                    {"renderHeaderResults" in step &&
                      step.renderHeaderResults(state, resetState)}
                    <CircleCheck className="w-6 h-6 text-green-600" />
                  </div>
                )}
              </div>
              {currentIndex === index && step.validateProps(state) && (
                <step.component
                  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                  {...(state as any)}
                  onSuccess={(state) => {
                    setStatePartial(state);
                    nextStep();
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </SetupStateContextProvider>
  );
}
