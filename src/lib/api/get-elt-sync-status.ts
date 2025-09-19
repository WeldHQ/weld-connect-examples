import { get } from "./api-request";

export type JobStatus = {
  bytes_synced: number;
  error_message?: string;
  estimated_total_count?: number;
  finished_at?: string;
  full_sync_trigger?: string;
  operation_mode?: string;
  records_synced?: number;
  retry_attempt?: 0;
  started_at?: string;
  status?: string;
  details?: string;
};

export type StreamStatus = {
  name: string;
  active_sync?: JobStatus;
  latest_sync?: JobStatus;
};

export type GetELTSyncStatusResponse = {
  elt_sync_id: string;
  source_streams: StreamStatus[];
};

export const getEltSyncStatus = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return get<GetELTSyncStatusResponse>(
    `/elt_syncs/${params.eltSyncId}/status`,
    params.apiKey,
  );
};
