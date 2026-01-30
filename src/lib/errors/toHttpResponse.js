import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";

export function toHttpResponse(err) {
  // Known error
  if (err instanceof AppError) {
    return Response.json(
      {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
      { status: err.status }
    );
  }

  // Unknown error
  console.error("Unhandled error:", err);

  return Response.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}
