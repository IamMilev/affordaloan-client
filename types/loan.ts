export type LoanTypeValue = "mortgage" | "consumer";

export interface LoanData {
  loanType: LoanTypeValue | null;
  income: string;
  loanAmount: number;
  term: number;
  activeDebt?: number;
  propertyValue?: number;
  interest?: string;
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

export type InterestRates = Record<LoanTypeValue, number>;

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  city: string;
  contactMethod: "email" | "phone" | "both";
}
