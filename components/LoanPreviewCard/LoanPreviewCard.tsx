"use client";

import { useTranslations } from "next-intl";
import { calculateLoan } from "@/utils/loanCalculations";
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

  const incomeNumber = parseFloat(income.replace(/,/g, "")) || 0;
  const currentRate = loanType === "mortgage" ? mortgage : consumer;

  // Use shared calculation utility
  const result = loanType
    ? calculateLoan({
        loanAmount,
        termMonths: term,
        interestRate: currentRate,
        income: incomeNumber,
        loanType,
        existingDebt: 0, // Preview card usually doesn't know about debts unless passed, assuming 0 for quick preview or add prop if needed.
        // Wait, Step 3 uses loanData which has activeDebt.
        // LoanPreviewCard props don't have activeDebt.
        // However, the issue described was about defaults.
        // Let's check props. It only has: loanType, income, loanAmount, term, interestRates.
        // The DTI shown in the preview card (first block) was 34%, which is (Payment / Income).
        // The utility calculates DTI based on TOTAL debt. If we pass 0 existing debt, it will be (Payment / Income).
      })
    : null;

  const monthlyPayment = result ? result.monthlyPayment : 0;
  const _paymentRatio = result ? result.dti / 100 : 0; // result.dti is percentage (0-100)
  const isAffordable = result ? result.isAffordable : true;
  const totalPayment = result ? result.totalPayment : 0;

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
          {t("incomePercentage")}: {result ? result.dti.toFixed(1) : 0}%
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
