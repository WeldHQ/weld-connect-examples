import { get } from "./api-request";

export type GetELTSyncResponse = {
  id: string;
  status: string;
  sync_interval: string;
  destination_schema_name: string;
  source_integration_id: string;
  destination_integration_id: string;
  start_date: string;
  created_at: string;
  updated_at: string;
  orchestration_workflow_id: string;
  streams: {
    id: string;
    elt_sync_id: string;
    name: string;
    incremental_primary_key_name: string[];
    incremental_pointer_id: string;
    full_sync_at_midnight: boolean;
    full_sync_always: boolean;
    protected_from_full_sync: boolean;
    created_at: string;
    updated_at: string;
  }[];
};

export const getEltSync = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return get<GetELTSyncResponse>(
    `/elt_syncs/${params.eltSyncId}`,
    params.apiKey,
  );
};
