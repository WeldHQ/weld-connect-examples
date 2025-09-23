import { post } from "./api-request";

export type SourceStreamParam = {
  name: string;
  excluded_columns: string[];
  full_sync_always: boolean;
  full_sync_at_midnight: boolean;
  hashed_columns: string[];
  incremental_pointer_id: string;
  protected_from_full_sync: boolean;
};

export type SourceStream = {
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
};

export type AddSourceStreamsResponse = {
  source_streams: SourceStream[];
};

export const addSourceStreams = async (params: {
  eltSyncId: string;
  sourceStreams: SourceStreamParam[];
  apiKey: string;
}) => {
  return post<AddSourceStreamsResponse>(
    `/elt_syncs/${params.eltSyncId}/source_streams`,
    params.apiKey,
    {
      source_streams: params.sourceStreams,
    },
  );
};
