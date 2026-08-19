type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ApiError extends Error {}

/** Thin fetch wrapper used by client components. */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Invalid server response.");
  }

  if (!res.ok || !body.success) {
    throw new ApiError(
      body && "error" in body && body.error
        ? body.error
        : "Something went wrong. Please try again.",
    );
  }

  return body.data;
}