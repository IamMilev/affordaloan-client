"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CustomRangeSlider from "@/components/Slider/Slider";

interface TermSelectorProps {
  term: number;
  onTermChange: (term: number) => void;
}

const TermSelector: React.FC<TermSelectorProps> = ({ term, onTermChange }) => {
  const t = useTranslations("step1");
  const tCommon = useTranslations("common");

  const minMonths = 60;
  const maxMonths = 360; // 30 years

  // Local state to handle the slider value
  const [sliderValue, setSliderValue] = useState(term || 120);

  // Sync with parent when term changes
  useEffect(() => {
    if (term) {
      setSliderValue(term);
    }
  }, [term]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    onTermChange(value);
  };

  const _formatTerm = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} ${t("term.years")}`;
    }

    return `${years} ${t("term.years")} ${tCommon("and")} ${remainingMonths} ${tCommon("month")}`;
  };

  return (
    <div>
      <h2 className="text-lg mb-4 font-semibold text-gray-800 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          4
        </span>
        {t("term.label")}
      </h2>

      <div className="bg-white">
        <div className="relative">
          <CustomRangeSlider
            value={sliderValue}
            onChange={handleSliderChange}
            min={minMonths}
            max={maxMonths}
            step={6}
            formatValue={(val) => {
              const years = Math.floor(val / 12);
              const months = val % 12;
              return months === 0
                ? `${years} ${t("term.years")}`
                : `${years} ${t("term.years")} ${months} ${tCommon("month")}`;
            }}
            showSteps={false}
            showDebugInfo={false}
            showQuickSelect={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TermSelector;
