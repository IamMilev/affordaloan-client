"use client";

import { useMemo } from "react";
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import type { LoanData, InterestRates } from "@/types/loan";
import LoanPreviewCard from "../LoanPreviewCard/LoanPreviewCard";
import TrustBadge from "../TrustBadge/TrustBadge";

interface LoanCalculatorStep3Props {
  loanData: LoanData;
  userName?: string;
  setStep: (step: number) => void;
  interestRates: InterestRates;
}

const LoanCalculatorStep3: React.FC<LoanCalculatorStep3Props> = ({
  loanData,
  userName,
  setStep,
  interestRates,
}) => {
  const t = useTranslations("step3");
  const tCommon = useTranslations("common");
  const { mortgage, consumer } = interestRates;

  // Calculate interest rate and monthly payment
  const interestRate = useMemo(() => {
    return loanData.loanType === "mortgage" ? mortgage : consumer;
  }, [loanData.loanType, mortgage, consumer]);

  const monthlyPayment = useMemo(() => {
    const principal = loanData.loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanData.term;

    return (
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  }, [loanData.loanAmount, loanData.term, interestRate]);

  // Calculate debt-to-income ratio
  const analysis = useMemo(() => {
    const monthlyIncome = parseFloat(loanData.income.replace(/,/g, ""));
    const totalMonthlyDebt = monthlyPayment + (loanData.activeDebt || 0);
    const dti = (totalMonthlyDebt / monthlyIncome) * 100;

    // Determine recommendation based on DTI ratio
    let recommendation: "excellent" | "good" | "risky" | "notRecommended";
    let adviceCount: number;

    if (dti <= 30) {
      recommendation = "excellent";
      adviceCount = 4;
    } else if (dti <= 40) {
      recommendation = "good";
      adviceCount = 4;
    } else if (dti <= 50) {
      recommendation = "risky";
      adviceCount = 5;
    } else {
      recommendation = "notRecommended";
      adviceCount = 5;
    }

    return {
      dti,
      recommendation,
      adviceCount,
      totalMonthlyDebt,
      monthlyIncome,
    };
  }, [loanData.income, monthlyPayment, loanData.activeDebt]);

  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case "excellent":
        return "text-green-700";
      case "good":
        return "text-blue-700";
      case "risky":
        return "text-blue-700";
      case "notRecommended":
        return "text-blue-900";
    }
  };

  const getRecommendationBg = () => {
    switch (analysis.recommendation) {
      case "excellent":
        return "from-green-50 to-green-100 border-green-300";
      case "good":
        return "from-blue-50 to-blue-100 border-blue-300";
      case "risky":
        return "from-blue-50 to-blue-100 border-blue-300";
      case "notRecommended":
        return "from-blue-100 to-blue-200 border-blue-400";
    }
  };

  const getRecommendationIcon = () => {
    switch (analysis.recommendation) {
      case "excellent":
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case "good":
        return <CheckCircle className="w-12 h-12 text-blue-600" />;
      case "risky":
        return <AlertCircle className="w-12 h-12 text-blue-600" />;
      case "notRecommended":
        return <XCircle className="w-12 h-12 text-blue-800" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleBack = () => {
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-8 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={3} totalSteps={3} />

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userName
                  ? t("titlePersonalized", { name: userName })
                  : t("title")}
              </h1>
              <p className="text-gray-600">{t("subtitle")}</p>
            </div>

            <LoanPreviewCard
              loanAmount={loanData.loanAmount}
              loanType={loanData.loanType}
              term={loanData.term}
              income={loanData.income}
              interestRates={interestRates}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">{t("loanAmount")}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(loanData.loanAmount)} {tCommon("currency")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">
                  {t("incomePercentage")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.dti.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  1
                </span>
                {t("recommendation.title")}
              </h2>

              <div
                className={`rounded-xl p-6 border-2 bg-gradient-to-br ${getRecommendationBg()}`}
              >
                <div className="flex flex-col md:flex-row items-start mb-4">
                  <div className="mr-4 flex-shrink-0">
                    {getRecommendationIcon()}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-2xl font-bold mb-2 ${getRecommendationColor()}`}
                    >
                      {t(`recommendation.${analysis.recommendation}.message`)}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {t("recommendation.paymentPrefix")}{" "}
                      <span className="font-bold">
                        {formatCurrency(analysis.totalMonthlyDebt)}{" "}
                        {tCommon("currency")}
                      </span>{" "}
                      {t("recommendation.paymentMiddle")}{" "}
                      <span className="font-bold">
                        {formatCurrency(analysis.monthlyIncome)}{" "}
                        {tCommon("currency")}
                      </span>{" "}
                      {t("recommendation.paymentSuffix")}
                      {loanData.activeDebt && (
                        <>
                          {" "}
                          {t("recommendation.includesDebts", {
                            debt: `${formatCurrency(loanData.activeDebt || 0)} ${tCommon("currency")}`,
                          })}
                        </>
                      )}
                      .
                    </p>

                    <div className="bg-white rounded-lg p-5">
                      <h4 className="font-bold text-gray-900 mb-3">
                        {t("recommendation.adviceTitle")}:
                      </h4>
                      <ul className="space-y-2">
                        {Array.from(
                          { length: analysis.adviceCount },
                          (_, i) => (
                            <li
                              key={`${analysis.dti}${i}`}
                              className="flex items-start"
                            >
                              <span className="text-blue-600 mr-2 flex-shrink-0">
                                •
                              </span>
                              <span className="text-sm text-gray-700">
                                {t(
                                  `recommendation.${analysis.recommendation}.advice${i + 1}`,
                                )}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <TrustBadge />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{tCommon("back")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep3;
