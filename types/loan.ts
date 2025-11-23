export type LoanTypeValue = "mortgage" | "consumer";

export interface LoanData {
  loanType: LoanTypeValue | null;
  income: string;
  loanAmount: number;
  term: number;
}

export interface LoanAmountRanges {
  mortgage: { min: number; max: number; step: number };
  consumer: { min: number; max: number; step: number };
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  isAffordable: boolean;
  debtToIncomeRatio: number;
}
