import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeyValue } from "@/lib/api-key-context";
import {
  type CreateConnectionBridgeResponse,
  createConnectionBridge,
} from "@/lib/api/create-connection-bridge";
import { listIntegrations } from "@/lib/api/list-integrations";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { useRouter } from "@tanstack/react-router";
import { IntegrationSelect } from "../integration-select";

export function CreateConnectionBridgeContainer(props: {
  onSuccess: (state: {
    connectionBridge: CreateConnectionBridgeResponse;
    integrationId: string;
  }) => void;
}) {
  const apiKey = useApiKeyValue();

  const router = useRouter();

  const [selectedIntegrationId, setSelectedIntegrationId] = useState<
    string | undefined
  >(undefined);
  const [connectionLabel, setConnectionLabel] = useState("my-connection");

  const { data: integrationsData } = useQuery({
    queryKey: ["list-integrations", apiKey],
    queryFn: async () => {
      if (!apiKey.trim()) return { data: [] };
      return await listIntegrations({ apiKey });
    },
    retry: false,
    refetchOnWindowFocus: true,
  });

  const { mutate, error, data, isPending, status } = useMutation({
    mutationFn: createConnectionBridge,
    onError: (error) => {
      console.error("Error creating connection bridge:", error);
    },
    onSuccess: (data, variables) => {
      props.onSuccess({
        connectionBridge: data,
        integrationId: variables.integrationId,
      });
    },
  });

  const handleCreateConnectionBridge = () => {
    if (!selectedIntegrationId) {
      alert("Please select an integration");
      return;
    }
    mutate({
      integrationId: selectedIntegrationId,
      label: connectionLabel,
      redirectUri: `${window.location.origin}${router.basepath}authorize-callback.html`,
      apiKey,
    });
  };

  return (
    <div className="rounded-md border overflow-clip">
      <div className="flex flex-col">
        <div className="p-6 space-y-6">
          <p className="text-muted-foreground text-sm">
            Create a connection bridge to start the authorization process.
          </p>
          <div className="flex gap-6">
            <div className="grid max-w-sm items-center gap-3">
              <Label htmlFor="integration-select">Select Integration</Label>
              <IntegrationSelect
                integrations={integrationsData?.data || []}
                onSelect={setSelectedIntegrationId}
              />
            </div>
            <div className="grid max-w-sm items-center gap-3">
              <Label htmlFor="connection-label">Connection Name</Label>
              <Input
                id="connection-label"
                type="text"
                value={connectionLabel}
                onChange={(e) => setConnectionLabel(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={!selectedIntegrationId || !connectionLabel || !apiKey}
            onClick={handleCreateConnectionBridge}
          >
            Connect
          </Button>
        </div>
        {status !== "idle" && (
          <div className="overflow-x-auto p-6 bg-gray-100 border-t border-gray-200">
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : error ? (
              <pre className="text-sm text-red-600">{error.message}</pre>
            ) : data ? (
              <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
