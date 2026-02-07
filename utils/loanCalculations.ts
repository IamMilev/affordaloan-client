export interface LoanCalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalMonthlyDebt: number;
  dti: number;
  propertyTax: number;
  insurance: number;
  isAffordable: boolean;
  maxAffordableLoan: number;
}

export interface LoanCalculationParams {
  loanAmount: number;
  termMonths: number;
  interestRate: number; // Annual % (e.g. 3.4)
  income: number;
  existingDebt?: number;
  loanType: "mortgage" | "consumer";
  downPayment?: number;
}

export const calculateLoan = (
  params: LoanCalculationParams,
): LoanCalculationResult => {
  const {
    loanAmount,
    termMonths,
    interestRate,
    income,
    existingDebt = 0,
    loanType,
    downPayment = 0,
  } = params;

  // Monthly interest rate (Nominal) - matches backend
  const monthlyRate = interestRate / 12 / 100;

  // Calculate base monthly payment (Principal + Interest)
  let baseMonthlyPayment = 0;
  if (monthlyRate === 0) {
    baseMonthlyPayment = loanAmount / termMonths;
  } else {
    baseMonthlyPayment =
      (loanAmount * (monthlyRate * (1 + monthlyRate) ** termMonths)) /
      ((1 + monthlyRate) ** termMonths - 1);
  }

  // Add Property Tax and Insurance for Mortgages - matches backend
  let propertyTax = 0;
  let insurance = 0;

  if (loanType === "mortgage") {
    // Backend logic: (HomeValue * 0.002) / 12
    // Assuming LoanAmount + DownPayment = HomeValue
    const homeValue = loanAmount + (downPayment || 0);
    propertyTax = (homeValue * 0.002) / 12;
    insurance = 15.0;
  }

  const totalMonthlyPayment = baseMonthlyPayment + insurance;
  const totalPayment = totalMonthlyPayment * termMonths;

  // existingDebt is validated as non-negative in backend, we assume safe here or use Math.max(0, existingDebt)
  const safeExistingDebt = Math.max(0, existingDebt);
  const totalMonthlyDebt = safeExistingDebt + totalMonthlyPayment;

  // DTI
  let dti = 0;
  if (income > 0) {
    dti = (totalMonthlyDebt / income) * 100;
  } else {
    dti = 999.99;
  }

  // Affordability
  const maxRatio = loanType === "consumer" ? 35 : 40; // 35% or 40%
  const isAffordable = dti <= maxRatio;

  // Max Affordable Loan Calculation (Simplified for UI, or we can mirror backend fully if needed)
  // Mirroring backend logic for max affordable loan:
  const maxAffordablePayment = Math.max(
    0,
    income * (maxRatio / 100) - safeExistingDebt,
  );

  let maxAffordableLoan = 0;
  let availableForPrincipalAndInterest = maxAffordablePayment;

  if (loanType === "mortgage") {
    availableForPrincipalAndInterest = Math.max(
      0,
      maxAffordablePayment - propertyTax - insurance,
    );
  }

  if (availableForPrincipalAndInterest > 0) {
    if (monthlyRate === 0) {
      maxAffordableLoan = availableForPrincipalAndInterest * termMonths;
    } else {
      maxAffordableLoan =
        availableForPrincipalAndInterest *
        ((1 - (1 + monthlyRate) ** -termMonths) / monthlyRate);
    }
  }

  return {
    monthlyPayment: totalMonthlyPayment,
    totalPayment,
    totalMonthlyDebt,
    dti,
    propertyTax,
    insurance,
    isAffordable,
    maxAffordableLoan,
  };
};
