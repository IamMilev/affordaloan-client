import type { ApiError, LoanStatsResponse } from "@/types/api";

export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_INTERNAL_URL}/api/stats`);

    if (!response.ok) {
      const error: ApiError = { error: `Go API failed` };
      return Response.json(error, { status: response.status });
    }

    const data: LoanStatsResponse = await response.json();
    return Response.json(data);
  } catch (_) {
    const apiError: ApiError = { error: "Failed to fetch stats" };
    return Response.json(apiError, { status: 500 });
  }
}
