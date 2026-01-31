"use client";

import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";

// Import all separate components
import LoanTypeSelector from "@/components/LoanTypeSelector/LoanTypeSelector";
import IncomeInput from "@/components/IncomeInput/IncomeInput";
import LoanAmountSlider from "@/components/LoanAmountSlider/LoanAmountSlider";
import TermSelector from "@/components/TermSelector/TermSelector";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import type { LoanData, LoanTypeValue } from "@/types/loan";

interface LoanCalculatorStep1Props {
  onContinue?: (data: LoanData, step: number) => void;
  useIncomeSlider?: boolean;
}

const LoanCalculatorStep1: React.FC<LoanCalculatorStep1Props> = ({
  onContinue,
  useIncomeSlider = false,
}) => {
  const [loanData, setLoanData] = useState<LoanData>({
    loanType: "mortgage",
    income: "1200",
    loanAmount: 150000,
    term: 120,
  });

  const handleLoanTypeSelect = useCallback(
    (type: LoanTypeValue) => {
      // Adjust loan amount if it exceeds the new loan type's maximum
      const loanAmountRanges = {
        mortgage: { min: 50000, max: 500000 },
        consumer: { min: 5000, max: 100000 },
      };

      const range = loanAmountRanges[type];
      const adjustedAmount = Math.min(loanData.loanAmount, range.max);

      setLoanData((prev) => ({
        ...prev,
        loanType: type,
        loanAmount: adjustedAmount,
      }));
    },
    [loanData.loanAmount],
  );

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} totalSteps={3} />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Колко голям кредит можеш да си позволиш?
            </h1>
            <p className="text-gray-600">
              Открий възможностите си за финансиране бързо и лесно
            </p>
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

          <div className="grid grid-cols-2 grid-rows-1 gap-10">
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

          {/* Continue Button */}
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
            <span>Продължи</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            🔒 Данните ти са защитени | 📊 Точни изчисления | ⚡ Бърз резултат
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep1;
