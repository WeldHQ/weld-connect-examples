import type { ErrorObject } from "ajv";
import { useState } from "react";

import { DateSelect } from "@/components/shared/date-select";
import { JsonForm } from "@/components/shared/json-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeyValue } from "@/lib/api-key-context";
import {
  type CreateEltSyncResponse,
  createEltSync,
} from "@/lib/api/create-elt-sync";
import { getEltSettings } from "@/lib/api/get-elt-settings";
import { useSetupState } from "@/lib/setup-state-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SyncIntervalSelect } from "../sync-interval-select";

function generateDestinationSchemaName(input: string) {
  return input
    .trim()
    .replace(/\W/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function CreateELTSyncContainer(props: {
  connectionId: string;
  onSuccess: (state: { eltSync: CreateEltSyncResponse }) => void;
}) {
  const { connectionId } = props;
  const apiKey = useApiKeyValue();
  const state = useSetupState();

  const { data: eltSettingsSchema, isLoading: isLoadingEltSettings } = useQuery(
    {
      queryKey: ["get-elt-settings", connectionId, apiKey],
      queryFn: () => {
        return getEltSettings({ connectionId, apiKey });
      },
    },
  );

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<ErrorObject[]>([]);

  const [syncInterval, setSyncInterval] = useState("0 0 * * *");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [destinationSchemaName, setDestinationSchemaName] = useState(
    state.integrationId
      ? generateDestinationSchemaName(state.integrationId)
      : "",
  );

  const { mutate, isPending } = useMutation({
    mutationFn: createEltSync,
    onError: (error) => {
      console.error("Error creating ELT sync:", error);
    },
    onSuccess: (data) => {
      props.onSuccess({ eltSync: data });
    },
  });

  const handleCreateSync = () => {
    mutate({
      connectionId,
      destinationSchemaName,
      eltSettings: formData,
      startDate,
      syncInterval,
      apiKey,
    });
  };

  return (
    <div className="rounded-md border overflow-clip">
      <div className="flex flex-col">
        <div className="text-muted-foreground p-6 text-sm space-y-2">
          <p>
            The ELT Settings form is generated with JSON Forms using the JSON
            Schema returned by the Weld Connect API.
          </p>
          <p>
            <em>React Material UI Renderer</em> is used for rendering the form.
          </p>
        </div>
        <div className="bg-gray-100 p-6 border-t">
          {isLoadingEltSettings ? (
            <div>Loading ELT settings...</div>
          ) : eltSettingsSchema ? (
            <div className="grid max-w-sm items-center gap-4">
              <Label htmlFor="integration-select">ELT Settings</Label>
              <JsonForm
                schema={eltSettingsSchema}
                onChange={(data, errors) => {
                  setFormData(data);
                  setFormErrors(errors);
                }}
              />
            </div>
          ) : (
            <div className="p-6">
              No ELT settings required for this integration.
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex gap-6">
            <div className="grid max-w-sm items-center gap-3">
              <Label htmlFor="sync-interval-select">Sync Interval</Label>
              <SyncIntervalSelect
                value={syncInterval}
                onChange={setSyncInterval}
              />
            </div>
            <div className="grid max-w-sm items-center gap-3">
              <Label htmlFor="start-date">Start Date</Label>
              <DateSelect value={startDate} onChange={setStartDate} />
            </div>
            <div className="grid max-w-sm items-center gap-3">
              <Label htmlFor="destination-schema">Destination Schema</Label>
              <Input
                id="destination-schema"
                type="text"
                value={destinationSchemaName}
                onChange={(e) => setDestinationSchemaName(e.target.value)}
                onBlur={() => {
                  setDestinationSchemaName((name) =>
                    generateDestinationSchemaName(name),
                  );
                }}
              />
            </div>
          </div>
          <Button
            className="mt-6"
            disabled={
              formErrors.length > 0 || !destinationSchemaName || isPending
            }
            onClick={handleCreateSync}
          >
            {isPending ? "Creating..." : "Create ELT Sync"}
          </Button>
        </div>
      </div>
    </div>
  );
}
