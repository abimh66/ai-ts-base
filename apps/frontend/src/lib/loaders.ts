import { notFound } from "@tanstack/react-router";
import { isHttpError } from "./api-error";

/**
 * Run a route loader's fetch, translating a 404 into the router's not-found so
 * an unknown id reads as missing rather than broken. Any other error bubbles to
 * the route's error component.
 */
export async function loadOrNotFound<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (isHttpError(error) && error.status === 404) {
      throw notFound();
    }
    throw error;
  }
}
