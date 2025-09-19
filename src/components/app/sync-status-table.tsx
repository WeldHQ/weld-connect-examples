import { useApiKeyValue } from "@/lib/api-key-context";
import {
  type JobStatus,
  type StreamStatus,
  getEltSyncStatus,
} from "@/lib/api/get-elt-sync-status";
import { useQuery } from "@tanstack/react-query";

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
import { Info, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const columns: ColumnDef<StreamStatus>[] = [
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
          <HoverCardContent className="w-fit">
            <pre className="text-sm">{JSON.stringify(syncStatus, null, 2)}</pre>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
];

export function EltSyncStatus(props: {
  eltSyncId: string;
}) {
  const apiKey = useApiKeyValue();

  const [refetchInterval, setRefetchInterval] = useState<number | false>(5_000);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["get-elt-sync-status", props.eltSyncId, apiKey],
    queryFn: () => {
      return getEltSyncStatus({ eltSyncId: props.eltSyncId, apiKey });
    },
    refetchInterval: refetchInterval,
    notifyOnChangeProps: "all",
  });

  const activeSyncSeenRef = useRef(false);
  useEffect(() => {
    if (data?.source_streams.some((x) => x.active_sync != null)) {
      activeSyncSeenRef.current = true;
    }

    if (
      data?.source_streams.every((x) => x.active_sync == null) &&
      activeSyncSeenRef.current
    ) {
      // No active syncs anymore, stop polling
      setRefetchInterval(false);
    }
  }, [data]);

  return (
    <div>
      <div className="mb-2 flex items-end gap-2">
        <h3 className="text-base font-medium px-2">ELT Sync Status</h3>
        <div className="ml-auto">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="px-3"
          >
            {isFetching && <LoaderCircle className="animate-spin" />}
            Refresh
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={data?.source_streams || []} />
    </div>
  );
}
