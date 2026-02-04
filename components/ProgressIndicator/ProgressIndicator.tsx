"use client";

import { useTranslations } from "next-intl";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
}) => {
  const t = useTranslations("progress");

  const steps = [
    { number: 1, label: t("step1"), active: currentStep >= 1 },
    { number: 2, label: t("step2"), active: currentStep >= 2 },
    { number: 3, label: t("step3"), active: currentStep >= 3 },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  step.active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${
                  step.active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-4 sm:w-8 h-1 mx-1 sm:mx-4 rounded ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      {/* Mobile step label */}
      <div className="sm:hidden text-center">
        <span className="text-sm font-medium text-blue-600">
          {steps[currentStep - 1]?.label}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
