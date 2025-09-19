import type { JsonSchema } from "@jsonforms/core";

import { get } from "./api-request";

export type GetELTSettingsResponse = JsonSchema;

export const getEltSettings = async (params: {
  connectionId: string;
  apiKey: string;
}) => {
  return get<GetELTSettingsResponse>(
    `/connections/${params.connectionId}/settings`,
    params.apiKey,
  );
};
