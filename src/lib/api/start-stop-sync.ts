import { post } from "./api-request";

export const startSync = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return post(`/elt_syncs/${params.eltSyncId}/start`, params.apiKey);
};

export const stopSync = async (params: {
  eltSyncId: string;
  apiKey: string;
}) => {
  return post(`/elt_syncs/${params.eltSyncId}/stop`, params.apiKey);
};
