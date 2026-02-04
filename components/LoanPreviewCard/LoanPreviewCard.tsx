"use client";

import { useTranslations } from "next-intl";
import type { LoanTypeValue, InterestRates } from "@/types/loan";

interface LoanPreviewCardProps {
  loanType: LoanTypeValue | null;
  income: string;
  loanAmount: number;
  term: number;
  interestRates: InterestRates;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("bg-BG").format(num);
};

const LoanPreviewCard: React.FC<LoanPreviewCardProps> = ({
  loanType,
  income,
  loanAmount,
  term,
  interestRates,
}) => {
  const t = useTranslations("loanPreview");
  const tCommon = useTranslations("common");

  const { mortgage, consumer } = interestRates;
  const calculateMonthlyPayment = (): number => {
    if (!loanAmount || !term) return 0;

    const interestRate = loanType === "mortgage" ? mortgage : consumer;
    const annualRate = interestRate / 100;
    const monthlyRate = (1 + annualRate) ** (1 / 12) - 1;
    const payments = term;

    if (monthlyRate === 0) return loanAmount / payments;

    return (
      (loanAmount * (monthlyRate * (1 + monthlyRate) ** payments)) /
      ((1 + monthlyRate) ** payments - 1)
    );
  };

  const monthlyPayment = calculateMonthlyPayment();
  const incomeNumber = parseFloat(income.replace(/,/g, "")) || 0;
  const paymentRatio = incomeNumber > 0 ? monthlyPayment / incomeNumber : 0;
  const isAffordable = paymentRatio <= 0.4; // 40% debt-to-income ratio
  const totalPayment = monthlyPayment * term;

  if (!loanType || !income || incomeNumber === 0) {
    return null;
  }

  return (
    <div
      className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 mb-8 ${
        isAffordable
          ? "bg-green-50 border-green-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">{t("monthlyPayment")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            ≈ {formatNumber(Math.round(monthlyPayment))} {tCommon("currency")}
          </p>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            isAffordable ? "text-green-600" : "text-blue-600"
          }`}
        >
          {isAffordable ? (
            <>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">
                {t("affordable")}
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">
                {t("notAffordable")}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm text-gray-600">
        <span>
          {t("incomePercentage")}: {Math.round(paymentRatio * 100)}%
        </span>
        <span>
          {t("totalPayment")}: {formatNumber(Math.round(totalPayment))}{" "}
          {tCommon("currency")}
        </span>
      </div>
    </div>
  );
};

export default LoanPreviewCard;
