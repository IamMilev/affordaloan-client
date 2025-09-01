export interface LoanStats {
  loan_type: string;
  total_banks: number;
  average_apr: number;
  lowest_apr: number;
  highest_apr: number;
}

export interface StatsRequest {
  loan_type: string;
}

// Additional helper types you might find useful
export interface ApiError {
  error: string;
}

// If you have multiple loan stats (array response)
export type LoanStatsResponse = LoanStats[];

// Union type for common loan types (adjust as needed)
export type LoanType =
  | "mortgage"
  | "personal"
  | "auto"
  | "student"
  | "business";
