import { post } from "./api-request";

export type CreateEltSyncResponse = {
  account_id: string;
  active: boolean;
  created_at: string;
  destination_connection_id: string;
  destination_integration_id: string;
  id: string;
  source_connection_id: string;
  source_integration_id: string;
  status: string;
  updated_at: string;
  config: Record<string, unknown>;
  destination_schema_name: string;
  start_date?: string;
  sync_interval: string;
};

export const createEltSync = async (params: {
  connectionId: string;
  destinationSchemaName: string;
  eltSettings: Record<string, unknown>;
  startDate?: Date;
  syncInterval: string;
  apiKey: string;
}) => {
  return post<CreateEltSyncResponse>("/elt_syncs", params.apiKey, {
    connection_id: params.connectionId,
    destination_schema_name: params.destinationSchemaName,
    elt_settings: params.eltSettings,
    start_date: params.startDate?.toISOString(),
    sync_interval: params.syncInterval,
  });
};
