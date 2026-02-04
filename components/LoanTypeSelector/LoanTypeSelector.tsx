"use client";

import { Home, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LoanTypeValue } from "@/types/loan";

interface LoanTypeSelectorProps {
  selectedType: LoanTypeValue | null;
  onTypeSelect: (type: LoanTypeValue) => void;
}

const LoanTypeSelector: React.FC<LoanTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const t = useTranslations("loanType");

  const loanTypes = [
    {
      id: "mortgage" as LoanTypeValue,
      title: t("mortgage"),
      icon: <Home className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      id: "consumer" as LoanTypeValue,
      title: t("consumer"),
      icon: <CreditCard className="w-8 h-8" />,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200 hover:bg-green-100",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          1
        </span>
        {t("label")}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {loanTypes.map((type) => (
          <button
            type="button"
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${
              selectedType === type.id
                ? `${type.bgColor} border-current ring-2 ring-blue-200 shadow-lg`
                : "bg-gray-50 border-gray-200 ring-2 ring-gray-200 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            <div
              className={`${selectedType === type.id ? type.color : "text-gray-600"} mr-3`}
            >
              {type.icon}
            </div>
            <h3
              className={`text-lg font-bold ${
                selectedType === type.id ? type.color : "text-gray-800"
              }`}
            >
              {type.title}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoanTypeSelector;
