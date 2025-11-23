"use client";

import { DollarSign } from "lucide-react";
import CustomRangeSlider from "@/components/Slider/Slider";
import type { LoanTypeValue } from "@/types/loan";

interface LoanAmountSliderProps {
  loanType: LoanTypeValue | null;
  loanAmount: number;
  onLoanAmountChange: (amount: number) => void;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("bg-BG").format(num);
};

const LoanAmountSlider: React.FC<LoanAmountSliderProps> = ({
  loanType,
  loanAmount,
  onLoanAmountChange,
}) => {
  const loanAmountRanges = {
    mortgage: { min: 50000, max: 500000, step: 5000 },
    consumer: { min: 5000, max: 100000, step: 1000 },
  };

  const getCurrentRange = () => {
    if (!loanType) return { min: 50000, max: 500000, step: 5000 };
    return loanAmountRanges[loanType];
  };

  const currentRange = getCurrentRange();

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          3
        </span>
        Размер на кредита
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {formatNumber(loanAmount)} лв.
          </span>
          <DollarSign className="w-6 h-6 text-blue-600" />
        </div>

        <CustomRangeSlider
          value={loanAmount}
          onChange={onLoanAmountChange}
          min={currentRange.min}
          max={currentRange.max}
          step={currentRange.step}
          formatValue={(val) => `${formatNumber(val)} лв.`}
          label="Размер на кредита"
          showDebugInfo={false}
        />

        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{formatNumber(currentRange.min)} лв.</span>
          <span>{formatNumber(currentRange.max)} лв.</span>
        </div>
      </div>
    </div>
  );
};

export default LoanAmountSlider;
