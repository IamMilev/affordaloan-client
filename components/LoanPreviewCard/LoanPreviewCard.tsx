import type { LoanTypeValue } from "@/types/loan";

interface LoanPreviewCardProps {
  loanType: LoanTypeValue | null;
  income: string;
  loanAmount: number;
  term: number;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("bg-BG").format(num);
};

const LoanPreviewCard: React.FC<LoanPreviewCardProps> = ({
  loanType,
  income,
  loanAmount,
  term,
}) => {
  // Mock calculation for preview (real calculation will be in API)
  const calculateMonthlyPayment = (): number => {
    if (!loanAmount || !term) return 0;

    // Simple interest calculation for preview
    const interestRate = loanType === "mortgage" ? 0.025 : 0.07;
    const monthlyRate = interestRate / 12;
    const payments = term * 12;

    if (monthlyRate === 0) return loanAmount / payments;

    return (
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, payments))) /
      (Math.pow(1 + monthlyRate, payments) - 1)
    );
  };

  const monthlyPayment = calculateMonthlyPayment();
  const incomeNumber = parseFloat(income.replace(/,/g, "")) || 0;
  const paymentRatio = incomeNumber > 0 ? monthlyPayment / incomeNumber : 0;
  const isAffordable = paymentRatio <= 0.4; // 40% debt-to-income ratio
  const totalPayment = monthlyPayment * term * 12;

  if (!loanType || !income || incomeNumber === 0) {
    return null;
  }

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all duration-200 mb-8 ${
        isAffordable
          ? "bg-green-50 border-green-200"
          : "bg-orange-50 border-orange-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Месечна вноска</p>
          <p className="text-2xl font-bold text-gray-900">
            ≈ {formatNumber(Math.round(monthlyPayment))} лв.
          </p>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            isAffordable ? "text-green-600" : "text-orange-600"
          }`}
        >
          {isAffordable ? (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">В граници на достъпност</span>
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="font-medium">Над препоръчаното</span>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>% от доходите: {Math.round(paymentRatio * 100)}%</span>
        <span>Общо плащане: {formatNumber(Math.round(totalPayment))} лв.</span>
      </div>
    </div>
  );
};

export default LoanPreviewCard;
