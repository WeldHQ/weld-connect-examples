import { post } from "./api-request";

export const requestFullRefresh = async (params: {
  eltStreamId: string;
  apiKey: string;
}) => {
  return post(
    `/elt_streams/${params.eltStreamId}/request_full_refresh`,
    params.apiKey,
  );
};
