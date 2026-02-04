"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    onTermChange(value);
  };

  const formatTerm = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} ${t("term.years")}`;
    }

    return `${years} ${t("term.years")} ${tCommon("and")} ${remainingMonths} ${tCommon("month")}`;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg mb-4 font-semibold text-gray-800 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          4
        </span>
        {t("term.label")}
      </h2>

      <div className="bg-white">
        <div className="py-3 px-2 flex items-center justify-between mb-2">
          <div className="text-2xl font-bold text-blue-600">
            {formatTerm(sliderValue)}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            {sliderValue} {tCommon("months")}
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min={minMonths}
            max={maxMonths}
            value={sliderValue}
            onChange={handleTermChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #51a2ff 0%, #3b82f6 ${((sliderValue - minMonths) / (maxMonths - minMonths)) * 100}%, #e5e7eb ${((sliderValue - minMonths) / (maxMonths - minMonths)) * 100}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>1 {t("term.year")}</span>
            <span>30 {t("term.years")}</span>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: 4px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

      `}</style>
    </div>
  );
};

export default TermSelector;
