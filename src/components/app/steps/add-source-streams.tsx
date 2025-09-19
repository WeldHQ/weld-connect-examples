import { useEffect, useState } from "react";

import { useApiKeyValue } from "@/lib/api-key-context";
import {
  type AddSourceStreamsResponse,
  type SourceStreamParam,
  addSourceStreams,
} from "@/lib/api/add-source-streams";
import { listAvailableSourceStreams } from "@/lib/api/list-available-source-streams";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateEltSyncResponse } from "@/lib/api/create-elt-sync";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, Check, PlusIcon, Trash } from "lucide-react";

const createEmptyStreamConfig = (streamName: string): SourceStreamParam => ({
  name: streamName,
  full_sync_always: false,
  full_sync_at_midnight: false,
  protected_from_full_sync: false,
  incremental_pointer_id: "",
  excluded_columns: [],
  hashed_columns: [],
});

export function AddSourceStreamsContainer(props: {
  eltSync: CreateEltSyncResponse;
  onSuccess: (state: { sourceStreams: AddSourceStreamsResponse }) => void;
}) {
  const eltSyncId = props.eltSync.id;
  const apiKey = useApiKeyValue();

  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [rawConfig, setRawConfig] = useState(
    JSON.stringify(selectedStreams, null, 2),
  );

  const [rawConfigError, setRawConfigError] = useState<string | null>(null);

  const removeStream = (streamName: string) => {
    setSelectedStreams((prev) => prev.filter((name) => name !== streamName));
    try {
      const config = JSON.parse(rawConfig) as SourceStreamParam[];
      const streamConfig = config.find((s) => s.name === streamName);
      if (streamConfig) {
        const newConfig = config.filter((s) => s.name !== streamName);
        setRawConfig(JSON.stringify(newConfig, null, 2));
      }
    } catch (e) {
      setRawConfigError((e as Error).message);
    }
  };

  const addStream = (streamName: string) => {
    if (selectedStreams.includes(streamName)) return;
    setSelectedStreams((prev) => [...prev, streamName]);
    try {
      const config = JSON.parse(rawConfig) as SourceStreamParam[];
      const newConfig = [...config];
      newConfig.push(createEmptyStreamConfig(streamName));
      setRawConfig(JSON.stringify(newConfig, null, 2));
    } catch (e) {
      setRawConfigError((e as Error).message);
    }
  };

  const handleRawConfigChange = (newRawConfig: string) => {
    setRawConfig(newRawConfig);
    try {
      const config = JSON.parse(newRawConfig) as SourceStreamParam[];
      const newSelectedStreams = config.map((s) => s.name);
      setSelectedStreams(newSelectedStreams);
      setRawConfigError(null);
    } catch (e) {
      setRawConfigError((e as Error).message);
    }
  };

  const availableSourceStreamsQuery = useQuery({
    queryKey: ["list-available-source-streams", eltSyncId, apiKey],
    queryFn: () => {
      return listAvailableSourceStreams({ eltSyncId, apiKey });
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (
      availableSourceStreamsQuery.data &&
      availableSourceStreamsQuery.data.data.length > 0
    ) {
      const streams = [
        {
          name: availableSourceStreamsQuery.data.data[0].name,
          full_sync_always: false,
          full_sync_at_midnight: false,
          protected_from_full_sync: false,
          incremental_pointer_id: "",
          excluded_columns: [],
          hashed_columns: [],
        },
      ];
      setRawConfig(JSON.stringify(streams, null, 2));
      setSelectedStreams(streams.map((s) => s.name));
    }
  }, [availableSourceStreamsQuery.data]);

  const { mutate, isPending } = useMutation({
    mutationFn: addSourceStreams,
    onError: (error) => {
      console.error("Error adding source streams:", error);
    },
    onSuccess: (data) => {
      props.onSuccess({ sourceStreams: data });
    },
  });

  const handleAddStreams = () => {
    try {
      const config = JSON.parse(rawConfig) as SourceStreamParam[];
      mutate({ eltSyncId, apiKey, streams: config });
    } catch (e) {
      setRawConfigError((e as Error).message);
    }
  };

  return (
    <div className="rounded-md border overflow-clip">
      <div className="flex flex-col">
        <div className="grid md:grid-cols-2 min-h-96 pt-6">
          <div className="px-6">
            <div className="grid w-full items-center gap-3">
              <Label>Available Source Streams</Label>
              <ul className="py-1 overflow-auto border rounded-md max-h-96">
                {availableSourceStreamsQuery.data?.data.map((stream) => {
                  const isSelected = selectedStreams.includes(stream.name);
                  return (
                    <li key={stream.name} className="relative group text-sm">
                      <button
                        type="button"
                        className={cn("w-full text-left pl-3 pr-12 relative", {
                          "bg-accent font-semibold": isSelected,
                          "hover:bg-gray-100": !isSelected,
                        })}
                        onClick={() => {
                          if (isSelected) {
                            removeStream(stream.name);
                          } else {
                            addStream(stream.name);
                          }
                        }}
                      >
                        <span className="leading-8">{stream.name}</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 inline-block group-hover:hidden" />
                              <Trash className="w-4 h-4 hidden group-hover:inline-block" />
                            </>
                          ) : (
                            <PlusIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="px-6 flex flex-col">
            <div className="grid w-full items-center gap-3">
              <Label>Configuration</Label>
              <div className="space-y-2">
                <Textarea
                  value={rawConfig}
                  onChange={(e) => handleRawConfigChange(e.target.value)}
                  className="font-mono grow bg-muted !text-xs h-96"
                />
                <div>
                  {rawConfigError && (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Error parsing config</AlertTitle>
                      <AlertDescription>
                        <p>{rawConfigError}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Button
            onClick={handleAddStreams}
            disabled={
              isPending ||
              rawConfigError !== null ||
              rawConfig.trim().length === 0 ||
              rawConfig.trim() === "[]"
            }
          >
            {isPending ? "Adding..." : "Add Streams"}
          </Button>
        </div>
      </div>
    </div>
  );
}
