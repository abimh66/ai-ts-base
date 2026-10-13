export type HttpErrorStatus = 400 | 404 | 409 | 502 | 503;

export class HttpError extends Error {
  constructor(
    readonly status: HttpErrorStatus,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
