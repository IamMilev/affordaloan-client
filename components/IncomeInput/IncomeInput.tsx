"use client";

import { User } from "lucide-react";
import CustomRangeSlider from "@/components/Slider/Slider";

interface IncomeInputProps {
  income: string;
  onIncomeChange: (income: string) => void;
  useSlider?: boolean;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("bg-BG").format(num);
};

const IncomeInput: React.FC<IncomeInputProps> = ({
  income,
  onIncomeChange,
  useSlider = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    const formatted = value ? formatNumber(parseInt(value)) : "";
    onIncomeChange(formatted);
  };

  const handleSliderChange = (value: number) => {
    onIncomeChange(formatNumber(value));
  };

  if (useSlider) {
    return (
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
            3
          </span>
          Месечни доходи (нето)
        </h2>
        <div className="mb-4">
          <CustomRangeSlider
            value={income ? parseInt(income.replace(/,/g, "")) : 1000}
            onChange={handleSliderChange}
            min={500}
            max={10000}
            step={100}
            formatValue={(val) => `${formatNumber(val)} лв.`}
            label="Месечни доходи"
            showDebugInfo={false}
            showSteps={false}
            showQuickSelect={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          2
        </span>
        Месечни доходи (нето)
      </h2>
      <div className="relative">
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={income}
          onChange={handleInputChange}
          placeholder="Напр. 2,500 лв."
          className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          лв.
        </span>
      </div>
    </div>
  );
};

export default IncomeInput;
