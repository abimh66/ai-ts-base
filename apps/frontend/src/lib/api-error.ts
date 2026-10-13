export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isHttpError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export async function readApiError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { error?: string };
    return new ApiError(body.error ?? "Request failed", res.status);
  } catch {
    return new ApiError("Request failed", res.status);
  }
}
