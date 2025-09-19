import { get } from "./api-request";

export type Integration = {
  id: string;
  name: string;
  min_required_plan: string;
};

type ListIntegrationsResponse = {
  data: Integration[];
  has_more: boolean;
};

export const listIntegrations = async (params: {
  apiKey: string;
}) => {
  return get<ListIntegrationsResponse>("/integrations", params.apiKey);
};
