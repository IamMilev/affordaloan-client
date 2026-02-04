"use client";

import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

// Import all separate components
import LoanTypeSelector from "@/components/LoanTypeSelector/LoanTypeSelector";
import IncomeInput from "@/components/IncomeInput/IncomeInput";
import LoanAmountSlider from "@/components/LoanAmountSlider/LoanAmountSlider";
import TermSelector from "@/components/TermSelector/TermSelector";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import type { LoanData, LoanTypeValue, LoanTypeDefaults } from "@/types/loan";

// Default values per loan type
const LOAN_TYPE_DEFAULTS: Record<LoanTypeValue, LoanTypeDefaults> = {
  mortgage: {
    loanAmount: 150000,
    term: 240,
    income: "2500",
  },
  consumer: {
    loanAmount: 15000,
    term: 60,
    income: "1500",
  },
};

interface LoanCalculatorStep1Props {
  onContinue?: (data: LoanData, step: number) => void;
  useIncomeSlider?: boolean;
}

const LoanCalculatorStep1: React.FC<LoanCalculatorStep1Props> = ({
  onContinue,
  useIncomeSlider = false,
}) => {
  const t = useTranslations("step1");
  const tCommon = useTranslations("common");
  const tTrust = useTranslations("trust");

  const [loanData, setLoanData] = useState<LoanData>({
    loanType: "mortgage",
    income: LOAN_TYPE_DEFAULTS.mortgage.income,
    loanAmount: LOAN_TYPE_DEFAULTS.mortgage.loanAmount,
    term: LOAN_TYPE_DEFAULTS.mortgage.term,
  });

  const handleLoanTypeSelect = useCallback((type: LoanTypeValue) => {
    const defaults = LOAN_TYPE_DEFAULTS[type];
    setLoanData((prev) => ({
      ...prev,
      loanType: type,
      loanAmount: defaults.loanAmount,
      term: defaults.term,
      income: defaults.income,
    }));
  }, []);

  const handleIncomeChange = useCallback((income: string) => {
    setLoanData((prev) => ({ ...prev, income }));
  }, []);

  const handleLoanAmountChange = useCallback((loanAmount: number) => {
    setLoanData((prev) => ({ ...prev, loanAmount }));
  }, []);

  const handleTermChange = useCallback((term: number) => {
    setLoanData((prev) => ({ ...prev, term }));
  }, []);

  const canContinue =
    loanData.loanType &&
    loanData.income &&
    parseFloat(loanData.income.replace(/,/g, "")) > 0;

  const handleContinue = () => {
    if (canContinue && onContinue) {
      onContinue(loanData, 2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-8 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={1} totalSteps={3} />

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("title")}
              </h1>
              <p className="text-gray-600">{t("subtitle")}</p>
            </div>

            {/* Loan Type Selector */}
            <LoanTypeSelector
              selectedType={loanData.loanType}
              onTypeSelect={handleLoanTypeSelect}
            />

            {/* Loan Amount Slider */}
            <LoanAmountSlider
              loanType={loanData.loanType}
              loanAmount={loanData.loanAmount}
              onLoanAmountChange={handleLoanAmountChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {/* Income Input */}
              <IncomeInput
                income={loanData.income}
                onIncomeChange={handleIncomeChange}
                useSlider={useIncomeSlider}
              />

              {/* Term Selector */}
              <TermSelector
                term={loanData.term}
                onTermChange={handleTermChange}
              />
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              {tTrust("dataProtected")} | {tTrust("accurateCalculations")} |{" "}
              {tTrust("fastResult")}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-white/25 backdrop-blur-xs border-t border-gray-200 shadow-lg px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            type="submit"
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
              canContinue
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>{tCommon("continue")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep1;
