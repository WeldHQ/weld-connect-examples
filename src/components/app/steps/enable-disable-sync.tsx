import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useApiKeyValue } from "@/lib/api-key-context";
import type { CreateEltSyncResponse } from "@/lib/api/create-elt-sync";
import { disableSync, enableSync } from "@/lib/api/enable-disable-sync";
import { getEltSync } from "@/lib/api/get-elt-sync";
import { useMutation, useQuery } from "@tanstack/react-query";

import { EltSyncStatus } from "../sync-status-table";

export function EnableDisableSyncContainer(props: {
  eltSync: CreateEltSyncResponse;
}) {
  const eltSyncId = props.eltSync.id;
  const apiKey = useApiKeyValue();

  const eltSyncQuery = useQuery({
    queryKey: ["elt-sync", eltSyncId],
    queryFn: () => getEltSync({ eltSyncId, apiKey }),
  });

  const enableMutation = useMutation({
    mutationFn: enableSync,
    onSuccess: () => {
      toast.success("Sync enabled", {
        description:
          "It will be executed periodically based on its sync interval",
      });
      eltSyncQuery.refetch();
    },
    onError: (error) => {
      toast.error("Error enabling sync", {
        description: (error as Error).message,
      });
      eltSyncQuery.refetch();
    },
  });

  const disableMutation = useMutation({
    mutationFn: disableSync,
    onSuccess: () => {
      toast.success("Sync disabled", {
        description: "It will no longer be executed periodically",
      });
      eltSyncQuery.refetch();
    },
    onError: (error) => {
      toast.error("Error disabling sync", {
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
            Your ELT sync is ready. Once you enable it, it will run on the
            schedule you selected.
          </p>
        ) : (
          <p>
            You can enable or disable your ELT sync at any time. When enabled,
            it will follow the schedule you selected.
          </p>
        )}
        <div className="flex gap-4">
          <Button
            onClick={() => enableMutation.mutate({ eltSyncId, apiKey })}
            disabled={
              eltSyncQuery.data?.status === "RUNNING" ||
              eltSyncQuery.isPending ||
              enableMutation.isPending
            }
          >
            Start
          </Button>
          {status !== "NOT_STARTED" && (
            <Button
              onClick={() => disableMutation.mutate({ eltSyncId, apiKey })}
              disabled={
                eltSyncQuery.data?.status !== "RUNNING" ||
                eltSyncQuery.isPending ||
                disableMutation.isPending
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
