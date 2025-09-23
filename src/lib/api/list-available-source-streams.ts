import { get } from "./api-request";

export type AvailableSourceStream = {
  name: string;
  is_selectable: boolean;
  preselect: boolean;
  sub_streams: string;
};

export type ListAvailableSourceStreamsResponse = {
  data: AvailableSourceStream[];
  has_more: boolean;
  next_cursor?: string;
};

export const listAvailableSourceStreams = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return get<ListAvailableSourceStreamsResponse>(
    `/elt_syncs/${params.eltSyncId}/available_source_streams`,
    params.apiKey,
  );
};
