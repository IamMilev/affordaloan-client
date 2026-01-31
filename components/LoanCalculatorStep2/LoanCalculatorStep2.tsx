"use client";

import { useState, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  Home,
  CreditCard,
  Edit2,
  Check,
} from "lucide-react";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import CustomRangeSlider from "@/components/Slider/Slider";
import type { InterestRates, LoanData } from "@/types/loan";

interface LoanCalculatorStep2Props {
  loanData: LoanData;
  onContinue?: (data: LoanData, step: number) => void;
  setStep: (step: number) => void;
  interestRates: InterestRates;
}

const LoanCalculatorStep2: React.FC<LoanCalculatorStep2Props> = ({
  loanData,
  onContinue,
  setStep,
  interestRates,
}) => {
  const [activeDebt, setActiveDebt] = useState(loanData.activeDebt || 0);
  const { mortgage, consumer } = interestRates;
  const [propertyValue, setPropertyValue] = useState(
    loanData.propertyValue ||
      (loanData.loanType === "mortgage" ? loanData.loanAmount * 1.1 : 0),
  );
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [latePaymentMonths, setLatePaymentMonths] = useState(1);

  // Calculate interest rate based on loan type
  const interestRate = useMemo(() => {
    return loanData.loanType === "mortgage" ? mortgage : consumer;
  }, [loanData.loanType, mortgage, consumer]);

  // Calculate monthly payment
  const monthlyPayment = useMemo(() => {
    const principal = loanData.loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanData.term;

    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return payment;
  }, [loanData.loanAmount, loanData.term, interestRate]);

  // Calculate upfront costs for mortgage
  const upfrontCosts = useMemo(() => {
    if (loanData.loanType !== "mortgage") return null;

    const downPayment = loanData.loanAmount * 0.1;
    const notaryFees = propertyValue * 0.04;
    const insurance = 500;
    const municipalityFee = 150;

    return {
      downPayment,
      notaryFees,
      insurance,
      municipalityFee,
      total: downPayment + notaryFees + insurance + municipalityFee,
    };
  }, [loanData.loanType, loanData.loanAmount, propertyValue]);

  // Calculate late payment consequences
  const latePaymentInfo = useMemo(() => {
    const dailyPenalty = monthlyPayment * 0.001;
    const monthlyPenalty = dailyPenalty * 30;
    const totalPenalty = monthlyPenalty * latePaymentMonths;
    const totalOwed = monthlyPayment * latePaymentMonths + totalPenalty;

    return {
      dailyPenalty,
      monthlyPenalty,
      totalPenalty,
      totalOwed,
      isCollectable: latePaymentMonths >= 6,
    };
  }, [monthlyPayment, latePaymentMonths]);

  const canContinue = true;

  const handleBack = () => {
    setStep(1);
  };

  const handleContinue = () => {
    const updatedData: LoanData = {
      ...loanData,
      activeDebt: activeDebt,
      propertyValue,
    };

    if (onContinue) {
      onContinue(updatedData, 3);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("bg-BG").format(value);
  };

  const getSeverityColor = (months: number) => {
    if (months >= 6) return "text-red-700";
    if (months >= 3) return "text-orange-700";
    return "text-yellow-700";
  };

  const getSeverityBg = (months: number) => {
    if (months >= 6) return "from-red-50 to-red-100 border-red-300";
    if (months >= 3) return "from-orange-50 to-orange-100 border-orange-300";
    return "from-yellow-50 to-yellow-100 border-yellow-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} totalSteps={3} />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Допълнителна информация
            </h1>
            <p className="text-gray-600">
              Помогни ни да изчислим точно твоите разходи
            </p>
          </div>

          {/* Active Debt Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                1
              </span>
              Месечна сума на активни задълженията
            </h2>

            <div className="mb-4">
              <div className="space-y-4">
                <CustomRangeSlider
                  value={activeDebt}
                  onChange={setActiveDebt}
                  min={0}
                  max={2000}
                  step={50}
                  formatValue={(val) => `${formatNumber(val)} лв.`}
                  label="Месечна сума на задълженията"
                  valueTextSize="3xl"
                  showDebugInfo={false}
                  showSteps={false}
                  showQuickSelect={false}
                />
              </div>
            </div>
          </div>

          {/* Property Value (only for mortgage) */}
          {loanData.loanType === "mortgage" && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  2
                </span>
                Стойност на имота
              </h2>

              {!isEditingProperty ? (
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Текуща стойност
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(propertyValue)} лв.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProperty(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border-2 border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Промени</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CustomRangeSlider
                    value={propertyValue}
                    onChange={setPropertyValue}
                    min={50000}
                    max={1000000}
                    step={5000}
                    formatValue={(val) => `${formatNumber(val)} лв.`}
                    label="Стойност на имота"
                    valueTextSize="3xl"
                    showDebugInfo={false}
                    showSteps={false}
                    showQuickSelect={false}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingProperty(false)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Потвърди</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Payment Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-bold text-gray-900">Месечни Разходи</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(monthlyPayment + activeDebt)} лв.
              </p>
              <p className="text-sm text-gray-600">
                Месечна вноска:{" "}
                <span className="font-semibold">
                  {formatCurrency(monthlyPayment)} лв.
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Други Задължения:{" "}
                <span className="font-semibold">
                  {formatCurrency(activeDebt)} лв.
                </span>
              </p>

              <p className="text-sm text-gray-600">
                Лихвен процент:{" "}
                <span className="font-semibold">{interestRate}%</span>
              </p>
              <p className="text-sm text-gray-600">
                Срок:{" "}
                <span className="font-semibold">{loanData.term} месеца</span>
              </p>
            </div>

            {/* Upfront Costs Card (only for mortgage) */}
            {loanData.loanType === "mortgage" && upfrontCosts && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center mb-3">
                  <Home className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-bold text-gray-900">
                    Първоначални разходи
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-3">
                  {formatCurrency(upfrontCosts.total)} лв.
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Аванс (10%):</span>
                    <span className="font-semibold">
                      {formatCurrency(upfrontCosts.downPayment)} лв.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Нотариални такси (4%):
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(upfrontCosts.notaryFees)} лв.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Застраховка:</span>
                    <span className="font-semibold">
                      {formatCurrency(upfrontCosts.insurance)} лв.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Общинска такса:</span>
                    <span className="font-semibold">
                      {formatCurrency(upfrontCosts.municipalityFee)} лв.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Late Payment Interactive Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                !
              </span>
              Последици от забавено плащане
            </h2>

            <div
              className={`rounded-xl p-6 border-2 transition-all duration-300 bg-gradient-to-br ${getSeverityBg(latePaymentMonths)}`}
            >
              <div className="flex items-start mb-4">
                <AlertTriangle
                  className={`w-6 h-6 mr-3 flex-shrink-0 mt-1 ${getSeverityColor(latePaymentMonths)}`}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Виж колко струва забавянето на плащанията
                  </h3>
                </div>
              </div>

              {/* Months Slider */}
              <div className="mb-6">
                <CustomRangeSlider
                  value={latePaymentMonths}
                  onChange={setLatePaymentMonths}
                  min={1}
                  max={12}
                  step={1}
                  formatValue={(val) =>
                    `${val} ${val === 1 ? "месец" : "месеца"}`
                  }
                  label="Месеци забава"
                  valueTextSize="3xl"
                  showDebugInfo={false}
                  showSteps={false}
                  showQuickSelect={false}
                />
              </div>

              {/* Late Payment Breakdown */}
              <div className="rounded-lg p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Месечна вноска x {latePaymentMonths}:
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(monthlyPayment * latePaymentMonths)} лв.
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Наказателна лихва:
                  </span>
                  <span
                    className={`font-bold ${getSeverityColor(latePaymentMonths)}`}
                  >
                    +{formatCurrency(latePaymentInfo.totalPenalty)} лв.
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Обща сума за плащане:
                    </span>
                    <span
                      className={`text-2xl font-bold ${getSeverityColor(latePaymentMonths)}`}
                    >
                      {formatCurrency(latePaymentInfo.totalOwed)} лв.
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Warning for 6+ months */}
              {latePaymentInfo.isCollectable && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">КРИТИЧНО ПРЕДУПРЕЖДЕНИЕ!</p>
                      <p className="text-sm">
                        При забава над 6 месеца банката има право да започне
                        процедура по изземване на имота! Това може да доведе до
                        загуба на собственост и допълнителни съдебни разноски.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* General Warning */}
              {!latePaymentInfo.isCollectable && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <Info className="w-4 h-4 inline mr-1" />
                    При многократни забави може да се стигне до изискване на
                    пълна сума и съдебно производство.
                    {latePaymentMonths >= 3 &&
                      " Забавите над 3 месеца се докладват в КИБ (Кредитен информационен бюро)."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад</span>
            </button>
            <button
              type="button"
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

export default LoanCalculatorStep2;
