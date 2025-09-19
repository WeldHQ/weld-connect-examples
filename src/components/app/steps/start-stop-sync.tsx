import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useApiKeyValue } from "@/lib/api-key-context";
import type { CreateEltSyncResponse } from "@/lib/api/create-elt-sync";
import { getEltSync } from "@/lib/api/get-elt-sync";
import { startSync, stopSync } from "@/lib/api/start-stop-sync";
import { useMutation, useQuery } from "@tanstack/react-query";

import { EltSyncStatus } from "../sync-status-table";

export function StartStopSyncContainer(props: {
  eltSync: CreateEltSyncResponse;
}) {
  const eltSyncId = props.eltSync.id;
  const apiKey = useApiKeyValue();

  const eltSyncQuery = useQuery({
    queryKey: ["elt-sync", eltSyncId],
    queryFn: () => getEltSync({ eltSyncId, apiKey }),
  });

  const startMutation = useMutation({
    mutationFn: startSync,
    onSuccess: () => {
      toast.success("Sync started");
      eltSyncQuery.refetch();
    },
    onError: (error) => {
      toast.error("Error starting sync", {
        description: (error as Error).message,
      });
      eltSyncQuery.refetch();
    },
  });

  const stopMutation = useMutation({
    mutationFn: stopSync,
    onSuccess: () => {
      toast.success("Sync stopped");
      eltSyncQuery.refetch();
    },
    onError: (error) => {
      toast.error("Error stopping sync", {
        description: (error as Error).message,
      });
    },
  });

  const status = eltSyncQuery.data?.status || "NOT_STARTED";
  return (
    <div className="rounded-md border overflow-clip p-6">
      <div className="flex flex-col gap-6">
        {status === "NOT_STARTED" ? (
          <p>
            Your ELT sync is ready. Once you start it, it will run on the
            schedule you selected.
          </p>
        ) : (
          <p>
            You can start or stop your ELT sync at any time. When running, it
            will follow the schedule you selected.
          </p>
        )}
        <div className="flex gap-4">
          <Button
            onClick={() => startMutation.mutate({ eltSyncId, apiKey })}
            disabled={
              eltSyncQuery.data?.status === "RUNNING" || eltSyncQuery.isPending
            }
          >
            Start
          </Button>
          {status !== "NOT_STARTED" && (
            <Button
              onClick={() => stopMutation.mutate({ eltSyncId, apiKey })}
              disabled={
                eltSyncQuery.data?.status !== "RUNNING" ||
                eltSyncQuery.isPending
              }
              variant="destructive"
            >
              Stop
            </Button>
          )}
        </div>
        <div>
          {status === "RUNNING" && <EltSyncStatus eltSyncId={eltSyncId} />}
        </div>
      </div>
    </div>
  );
}
