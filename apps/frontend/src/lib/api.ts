import { hc } from "hono/client";
import type { AppType } from "api/app";

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const client = hc<AppType>(apiBaseUrl);
