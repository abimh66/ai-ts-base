import type { QueryClientConfig } from "@tanstack/react-query";
import { isHttpError } from "./api-error";

const MAX_RETRIES = 1;

/** Retry once, but never a 4xx — those are the caller's fault and will not change. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isHttpError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export const queryDefaults: QueryClientConfig["defaultOptions"] = {
  queries: {
    staleTime: 30_000,
    retry: shouldRetryQuery,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};
