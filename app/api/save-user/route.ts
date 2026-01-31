import type { ApiError } from "@/types/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_INTERNAL_URL}/api/save-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error: ApiError = { error: "Failed to save user data" };
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (_) {
    const apiError: ApiError = { error: "Failed to save user data" };
    return Response.json(apiError, { status: 500 });
  }
}
