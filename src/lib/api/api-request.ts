const API_BASE_URL =
  (import.meta.env.VITE_WELD_CONNECT_URL as string) ||
  "https://connect.weld.app";

export async function get<T>(endpoint: string, apiKey: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });
  if (!response.ok) {
    console.debug(endpoint, "Response not ok:", response);
    throw new Error(`API GET failed: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function post<T = unknown>(
  endpoint: string,
  apiKey: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    // Try to parse error response, but handle empty body
    let errorResponse: Record<string, unknown> = {};
    try {
      errorResponse = await response.json();
    } catch {
      // No body
    }
    console.debug(endpoint, "Response not ok:", response, errorResponse);
    throw new Error(
      `API POST failed: ${
        errorResponse?.details || errorResponse?.message || response.statusText
      }`,
    );
  }
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
