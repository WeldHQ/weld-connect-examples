import { post } from "./api-request";

export const requestRun = async (params: {
  eltStreamId: string;
  apiKey: string;
}) => {
  return post(`/elt_streams/${params.eltStreamId}/request_run`, params.apiKey);
};
