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

const MORTGAGE_TIERS = [
  { to: 20000, step: 500, width: 25 },
  { to: 50000, step: 1000, width: 25 },
  { to: 200000, step: 1000, width: 25 },
  { to: 300000, step: 2500, width: 25 },
];

const CONSUMER_TIERS = [
  { to: 20000, step: 500, width: 25 },
  { to: 50000, step: 1000, width: 25 },
  { to: 80000, step: 1000, width: 50 },
];

const LOAN_CONFIGS = {
  mortgage: { min: 10000, tiers: MORTGAGE_TIERS },
  consumer: { min: 5000, tiers: CONSUMER_TIERS },
};

const LoanAmountSlider: React.FC<LoanAmountSliderProps> = ({
  loanType,
  loanAmount,
  onLoanAmountChange,
}) => {
  const t = useTranslations("step1");
  const tCommon = useTranslations("common");

  const config = loanType ? LOAN_CONFIGS[loanType] : LOAN_CONFIGS.mortgage;

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
          min={config.min}
          max={config.tiers[config.tiers.length - 1].to}
          tiers={config.tiers}
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
