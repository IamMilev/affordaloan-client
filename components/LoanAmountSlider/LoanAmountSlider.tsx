"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("step1");
  const tCommon = useTranslations("common");

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
          2
        </span>
        {t("loanAmount.label")}
      </h2>
      <div className="space-y-4">
        <CustomRangeSlider
          value={loanAmount}
          onChange={onLoanAmountChange}
          min={currentRange.min}
          max={currentRange.max}
          step={currentRange.step}
          formatValue={(val) => `${formatNumber(val)} ${tCommon("currency")}`}
          label={t("loanAmount.label")}
          valueTextSize="3xl"
          showDebugInfo={false}
        />
      </div>
    </div>
  );
};

export default LoanAmountSlider;
