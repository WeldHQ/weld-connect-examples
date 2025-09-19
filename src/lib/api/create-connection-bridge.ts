import { post } from "./api-request";

export type CreateConnectionBridgeResponse = {
  id: string;
  authorize_url: string;
  created_at: string;
  expires_at: string;
};

export const createConnectionBridge = async (params: {
  integrationId: string;
  redirectUri: string;
  label: string;
  apiKey: string;
}) => {
  return post<CreateConnectionBridgeResponse>(
    "/connection_bridges",
    params.apiKey,
    {
      redirect_uri: params.redirectUri,
      label: params.label,
      integration_id: params.integrationId,
    },
  );
};
