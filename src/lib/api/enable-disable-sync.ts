import { post } from "./api-request";

export const enableSync = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return post(`/elt_syncs/${params.eltSyncId}/enable`, params.apiKey);
};

export const disableSync = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return post(`/elt_syncs/${params.eltSyncId}/disable`, params.apiKey);
};
