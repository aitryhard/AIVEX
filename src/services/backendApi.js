import { API_URL } from "./config";
import { ENDPOINTS } from "./endpoints";

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}${ENDPOINTS.HEALTH}`);

  return response.ok;
}