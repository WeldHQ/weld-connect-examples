import { useApiKeyValue } from "@/lib/api-key-context";
import {
  type JobStatus,
  type StreamStatus,
  getEltSyncStatus,
} from "@/lib/api/get-elt-sync-status";
import { useMutation, useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Info, Loader, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GetELTSyncResponse } from "@/lib/api/get-elt-sync";
import { requestFullRefresh } from "@/lib/api/request-full-refresh";
import { requestRun } from "@/lib/api/request-run";
import { toast } from "sonner";

const columns: ColumnDef<StreamStatus & { streamId: string | undefined }>[] = [
  {
    accessorKey: "name",
    header: "Stream Name",
  },
  {
    header: "Active Sync",
    accessorKey: "active_sync",
    id: "active_sync",
    cell: ({ getValue }) => {
      const syncStatus = getValue() as JobStatus;
      if (!syncStatus) {
        return <div className="text-muted-foreground">N/A</div>;
      }
      return (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger>
            <Badge
              variant={
                syncStatus.status === "FAILED" ? "destructive" : "secondary"
              }
              className={cn("capitalize", {
                "bg-blue-500 text-white": syncStatus.status === "RUNNING",
                "bg-green-600 text-white": syncStatus.status === "COMPLETED",
              })}
            >
              {syncStatus.status?.toLowerCase()} <Info />
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit">
            <pre className="text-sm">{JSON.stringify(syncStatus, null, 2)}</pre>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    header: "Latest Sync",
    accessorKey: "latest_sync",
    id: "latest_sync",
    cell: ({ getValue }) => {
      const syncStatus = getValue() as JobStatus;
      if (!syncStatus) {
        return <div className="text-muted-foreground">N/A</div>;
      }
      return (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger>
            <Badge
              variant={
                syncStatus.status === "FAILED" ? "destructive" : "secondary"
              }
              className={cn("capitalize", {
                "bg-blue-500 text-white": syncStatus.status === "RUNNING",
                "bg-green-600 text-white": syncStatus.status === "COMPLETED",
              })}
            >
              {syncStatus.status?.toLowerCase()} <Info />
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-fit"
            side="bottom"
            align="end"
            avoidCollisions
          >
            <pre className="text-sm">{JSON.stringify(syncStatus, null, 2)}</pre>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    id: "actions",
    header: "",
    accessorKey: "streamId",
    cell: ({ getValue }) => {
      const streamId = getValue() as string | undefined;
      if (!streamId) {
        return null;
      }
      return <StreamActionsCell eltStreamId={streamId} />;
    },
  },
];

export function EltSyncStatus(props: {
  eltSync: GetELTSyncResponse;
}) {
  const apiKey = useApiKeyValue();

  const POLL_INTERVAL = 5_000;
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  const [pollEndTime, setPollEndTime] = useState<number | undefined>(undefined);

  const startPolling = (duration: number = 1 * 60 * 1000) => {
    setRefetchInterval(POLL_INTERVAL);
    setPollEndTime(Date.now() + duration);
  };

  const stopPolling = () => {
    setRefetchInterval(false);
    setPollEndTime(undefined);
  };

  useEffect(() => {
    // pollEndTime is initialized in useState
    let timeout: NodeJS.Timeout | undefined;
    if (refetchInterval && pollEndTime) {
      const delay = pollEndTime - Date.now();
      if (delay > 0) {
        timeout = setTimeout(() => {
          setRefetchInterval(false);
        }, delay);
      } else {
        setRefetchInterval(false);
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [refetchInterval, pollEndTime]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount only
  useEffect(() => {
    startPolling(5 * 60 * 1000);
  }, []);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["get-elt-sync-status", props.eltSync.id, apiKey],
    queryFn: () => {
      return getEltSyncStatus({ eltSyncId: props.eltSync.id, apiKey });
    },
    refetchInterval: refetchInterval,
    notifyOnChangeProps: "all",
  });

  const sourceStreams = (data?.source_streams || []).map((streamStatus) => {
    const streamId = props.eltSync.source_streams.find(
      (x) => x.name === streamStatus.name,
    )?.id;
    return {
      ...streamStatus,
      streamId,
    };
  });

  return (
    <div>
      <div className="mb-2 flex items-end gap-2">
        <h3 className="text-base font-medium px-2">ELT Sync Status</h3>
        <div className="ml-auto">
          <HoverCard>
            <HoverCardTrigger asChild>
              {refetchInterval ? (
                <div className="animate-pulse text-sm inline-flex items-center gap-1 cursor-default">
                  Auto updating
                  <Loader className="w-3 h-3 animate-spin animation-duration-[1.5s]" />
                </div>
              ) : (
                <Button
                  variant="link"
                  onClick={() => {
                    refetch();
                  }}
                  className="px-3 h-6"
                  size="sm"
                >
                  {isFetching ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <RotateCcw />
                  )}
                  Refresh
                </Button>
              )}
            </HoverCardTrigger>
            <HoverCardContent
              className="w-fit"
              side="top"
              align="end"
              avoidCollisions
            >
              <h3 className="font-medium mb-2 text-sm">Auto update</h3>
              <div>
                {refetchInterval ? (
                  <Button
                    onClick={() => stopPolling()}
                    size="sm"
                    variant="secondary"
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    onClick={() => startPolling(1 * 60 * 1000)}
                    size="sm"
                    variant="secondary"
                  >
                    Enable for 1 minute
                  </Button>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <DataTable columns={columns} data={sourceStreams} />
    </div>
  );
}

function StreamActionsCell(props: { eltStreamId: string }) {
  const apiKey = useApiKeyValue();

  const requestFullRefreshMutation = useMutation({
    mutationFn: requestFullRefresh,
    onSuccess: () => {
      toast.success("Full refresh requested", {
        description:
          "A full refresh for the next run has been requested successfully",
      });
    },
  });

  const requestRunMutation = useMutation({
    mutationFn: requestRun,
    onSuccess: () => {
      toast.success("Run requested", {
        description:
          "A run for the next execution has been requested successfully",
      });
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-7">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              requestRunMutation.mutate({
                eltStreamId: props.eltStreamId,
                apiKey,
              })
            }
          >
            Request run
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              requestFullRefreshMutation.mutate({
                eltStreamId: props.eltStreamId,
                apiKey,
              })
            }
          >
            Request full refresh
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
