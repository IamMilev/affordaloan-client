"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  Home,
  CreditCard,
  Edit2,
  Check,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import CustomRangeSlider from "@/components/Slider/Slider";
import { calculateLoan } from "@/utils/loanCalculations";
import type { InterestRates, LoanData, UserContactData } from "@/types/loan";
import TrustBadge from "../TrustBadge/TrustBadge";

const STEP2_STORAGE_KEY = "affordaloan-step2-state";

interface Step2PersistedState {
  activeDebt: number;
  propertyValue: number;
  customRate: number | null;
  contactName: string;
  contactEmail: string;
  latePaymentMonths: number;
}

function saveStep2State(state: Step2PersistedState) {
  try {
    localStorage.setItem(STEP2_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function loadStep2State(): Step2PersistedState | null {
  try {
    const raw = localStorage.getItem(STEP2_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Step2PersistedState;
  } catch {
    return null;
  }
}

interface LoanCalculatorStep2Props {
  loanData: LoanData;
  onComplete?: (data: LoanData, contact: UserContactData) => Promise<void>;
  setStep: (step: number) => void;
  interestRates: InterestRates;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const LoanCalculatorStep2: React.FC<LoanCalculatorStep2Props> = ({
  loanData,
  onComplete,
  setStep,
  interestRates,
}) => {
  const t = useTranslations("step2");
  const tCommon = useTranslations("common");

  const saved = useMemo(() => loadStep2State(), []);

  const [activeDebt, setActiveDebt] = useState(
    saved?.activeDebt ?? loanData.activeDebt ?? 0,
  );
  const { mortgage, consumer } = interestRates;
  const [propertyValue, setPropertyValue] = useState(
    saved?.propertyValue ??
      loanData.propertyValue ??
      (loanData.loanType === "mortgage" ? loanData.loanAmount * 1.1 : 0),
  );
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [isEditingDebt, setIsEditingDebt] = useState(false);
  const [latePaymentMonths, setLatePaymentMonths] = useState(
    saved?.latePaymentMonths ?? 1,
  );

  // Custom rate state
  const [customRate, setCustomRate] = useState<number | null>(
    saved?.customRate ?? null,
  );
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInputValue, setRateInputValue] = useState("");
  const [rateError, setRateError] = useState(false);

  // User contact state
  const [contactData, setContactData] = useState<UserContactData>({
    name: saved?.contactName ?? "",
    email: saved?.contactEmail ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  // Calculate default interest rate based on loan type
  const defaultRate = useMemo(() => {
    return loanData.loanType === "mortgage" ? mortgage : consumer;
  }, [loanData.loanType, mortgage, consumer]);

  // Calculate interest rate (use custom rate if set, otherwise default)
  const interestRate = useMemo(() => {
    if (customRate !== null) return customRate;
    return defaultRate;
  }, [customRate, defaultRate]);

  // Calculate monthly payment using shared utility
  const calculationResult = useMemo(() => {
    return calculateLoan({
      loanAmount: loanData.loanAmount,
      termMonths: loanData.term,
      interestRate: interestRate,
      income: 0, // Not needed for payment calculation here
      existingDebt: 0, // Not needed for payment calculation here
      loanType: loanData.loanType || "mortgage",
      downPayment: 0,
    });
  }, [loanData.loanAmount, loanData.term, interestRate, loanData.loanType]);

  const monthlyPayment = calculationResult.monthlyPayment;

  // Calculate upfront costs for mortgage
  const upfrontCosts = useMemo(() => {
    if (loanData.loanType !== "mortgage") return null;

    const downPayment = loanData.loanAmount * 0.1;
    const notaryFees = propertyValue * 0.04;
    const insurance = 250;
    const municipalityFee = 75;

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

  // Persist step2 state to localStorage
  useEffect(() => {
    saveStep2State({
      activeDebt,
      propertyValue,
      customRate,
      contactName: contactData.name,
      contactEmail: contactData.email,
      latePaymentMonths,
    });
  }, [
    activeDebt,
    propertyValue,
    customRate,
    contactData.name,
    contactData.email,
    latePaymentMonths,
  ]);

  const isEmailValid = isValidEmail(contactData.email);
  const showEmailError =
    emailTouched && contactData.email.length > 0 && !isEmailValid;
  const canContinue = contactData.name.trim().length > 0 && isEmailValid;

  const handleBack = () => {
    setStep(1);
  };

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const updatedData: LoanData = {
      ...loanData,
      activeDebt: activeDebt,
      propertyValue,
    };

    try {
      if (onComplete) {
        await onComplete(updatedData, contactData);
      }
    } catch {
      setSubmitError(tCommon("error"));
    } finally {
      setIsSubmitting(false);
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
    if (months >= 6) return "text-blue-900";
    if (months >= 3) return "text-blue-800";
    return "text-blue-700";
  };

  const getSeverityBg = (months: number) => {
    if (months >= 6) return "from-blue-100 to-blue-200 border-blue-400";
    if (months >= 3) return "from-blue-50 to-blue-100 border-blue-300";
    return "from-blue-50 to-blue-100 border-blue-200";
  };

  // Rate editing handlers
  const handleEditRate = () => {
    setRateInputValue(interestRate.toString());
    setRateError(false);
    setIsEditingRate(true);
  };

  const handleConfirmRate = () => {
    const value = parseFloat(rateInputValue);
    if (Number.isNaN(value) || value < 0.1 || value > 30) {
      setRateError(true);
      return;
    }
    setCustomRate(value);
    setRateError(false);
    setIsEditingRate(false);
  };

  const handleResetRate = () => {
    setCustomRate(null);
    setRateError(false);
    setIsEditingRate(false);
  };

  const currency = tCommon("currency");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-8 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={2} totalSteps={3} />

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("title")}
              </h1>
              <p className="text-gray-600">{t("subtitle")}</p>
            </div>

            {/* User Contact Form - At Top */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  1
                </span>
                {t("contact.title")}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t("contact.description")}
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t("contact.name")}{" "}
                      <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="contact-name"
                        type="text"
                        value={contactData.name}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            name: e.target.value,
                          })
                        }
                        placeholder={t("contact.namePlaceholder")}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t("contact.email")}{" "}
                      <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${showEmailError ? "text-red-400" : "text-gray-400"}`}
                      />
                      <input
                        id="contact-email"
                        type="email"
                        value={contactData.email}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            email: e.target.value,
                          })
                        }
                        onBlur={() => setEmailTouched(true)}
                        placeholder={t("contact.emailPlaceholder")}
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none ${
                          showEmailError
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                      />
                    </div>
                    {showEmailError && (
                      <p className="mt-2 text-sm text-red-600">
                        {t("contact.emailError")}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  {t("contact.privacyNote")}
                </p>
              </div>
            </div>

            {/* Loan Details Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  2
                </span>
                {t("debt.title")}
                {loanData.loanType === "mortgage" && `, ${t("property.title")}`}{" "}
                & {t("monthlyExpenses.interestRate")}
              </h2>

              <div className="flex flex-wrap gap-4">
                {/* Active Debt Block */}
                <div className="flex-1 min-w-[200px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t("debt.label")}
                    </h3>
                  </div>
                  {!isEditingDebt ? (
                    <div>
                      <p className="text-xl font-bold text-blue-600 mb-1">
                        {formatCurrency(activeDebt)} {currency}
                      </p>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {t("debt.description")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditingDebt(true)}
                        className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-blue-700 font-medium text-sm hover:bg-blue-50 transition-all duration-200 w-full"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t("debt.change")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CustomRangeSlider
                        value={activeDebt}
                        onChange={setActiveDebt}
                        min={0}
                        max={2000}
                        step={50}
                        formatValue={(val) =>
                          `${formatNumber(val)} ${currency}`
                        }
                        label=""
                        valueTextSize="xl"
                        showDebugInfo={false}
                        showSteps={false}
                        showQuickSelect={false}
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingDebt(false)}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all duration-200"
                      >
                        <Check className="w-3 h-3" />
                        <span>{t("debt.confirm")}</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Property Value Block (only for mortgage) */}
                {loanData.loanType === "mortgage" && (
                  <div className="flex-1 min-w-[200px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center mb-2">
                      <Home className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {t("property.title")}
                      </h3>
                    </div>
                    {!isEditingProperty ? (
                      <div>
                        <p className="text-xl font-bold text-blue-600 mb-1">
                          {formatCurrency(propertyValue)} {currency}
                        </p>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {t("property.description")}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsEditingProperty(true)}
                          className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-blue-700 font-medium text-sm hover:bg-blue-50 transition-all duration-200 w-full"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{t("property.change")}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <CustomRangeSlider
                          value={propertyValue}
                          onChange={setPropertyValue}
                          min={50000}
                          max={1000000}
                          step={5000}
                          formatValue={(val) =>
                            `${formatNumber(val)} ${currency}`
                          }
                          label=""
                          valueTextSize="xl"
                          showDebugInfo={false}
                          showSteps={false}
                          showQuickSelect={false}
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingProperty(false)}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all duration-200"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t("property.confirm")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Interest Rate Block */}
                <div className="flex-1 min-w-[200px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t("monthlyExpenses.interestRate")}
                    </h3>
                  </div>
                  {!isEditingRate ? (
                    <div>
                      <p className="text-xl font-bold text-blue-600 mb-1">
                        {interestRate}%
                        {customRate !== null && (
                          <span className="ml-2 text-xs font-normal text-blue-500">
                            ({t("monthlyExpenses.customRate")})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {t("monthlyExpenses.rateSource")}
                      </p>
                      <button
                        type="button"
                        onClick={handleEditRate}
                        className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-blue-700 font-medium text-sm hover:bg-blue-50 transition-all duration-200 w-full"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t("monthlyExpenses.editRate")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            max="30"
                            value={rateInputValue}
                            onChange={(e) => {
                              setRateInputValue(e.target.value);
                              setRateError(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleConfirmRate();
                              if (e.key === "Escape") setIsEditingRate(false);
                            }}
                            className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none text-lg font-semibold ${
                              rateError
                                ? "border-red-300 focus:border-red-500 bg-red-50"
                                : "border-gray-200 focus:border-blue-500"
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleConfirmRate}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                      {rateError && (
                        <p className="text-xs text-red-600">
                          {t("monthlyExpenses.rateValidation")}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {t("monthlyExpenses.rateSource")}: {defaultRate}%
                        </span>
                        {customRate !== null && (
                          <button
                            type="button"
                            onClick={handleResetRate}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {t("monthlyExpenses.resetRate")}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div
              className={`grid grid-cols-1 ${loanData.loanType === "mortgage" ? "md:grid-cols-2" : ""} gap-6 mb-8`}
            >
              {/* Monthly Payment Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-gray-900">
                    {t("monthlyExpenses.title")}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-3">
                  {formatCurrency(monthlyPayment + activeDebt)} {currency}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("monthlyExpenses.payment")}:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(monthlyPayment)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("monthlyExpenses.otherDebts")}:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(activeDebt)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("monthlyExpenses.interestRate")}:
                    </span>
                    <span className="font-semibold">{interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("monthlyExpenses.term")}:
                    </span>
                    <span className="font-semibold">
                      {loanData.term} {tCommon("months")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upfront Costs Card (only for mortgage) */}
              {loanData.loanType === "mortgage" && upfrontCosts && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center mb-3">
                    <Home className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-bold text-gray-900">
                      {t("upfrontCosts.title")}
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-3">
                    {formatCurrency(upfrontCosts.total)} {currency}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("upfrontCosts.downPayment")}:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(upfrontCosts.downPayment)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("upfrontCosts.notaryFees")}:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(upfrontCosts.notaryFees)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("upfrontCosts.insurance")}:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(upfrontCosts.insurance)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("upfrontCosts.municipalityFee")}:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(upfrontCosts.municipalityFee)}{" "}
                        {currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Late Payment Interactive Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  !
                </span>
                {t("latePayment.title")}
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
                      {t("latePayment.description")}
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
                      `${val} ${val === 1 ? tCommon("month") : tCommon("months")}`
                    }
                    label={t("latePayment.monthsLabel")}
                    valueTextSize="3xl"
                    showDebugInfo={false}
                    showSteps={false}
                    showQuickSelect={false}
                  />
                </div>

                {/* Late Payment Breakdown */}
                <div className="rounded-lg p-2 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {t("monthlyExpenses.payment")} x {latePaymentMonths}:
                    </span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {formatCurrency(monthlyPayment * latePaymentMonths)}{" "}
                      {currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {t("latePayment.penalty")}:
                    </span>
                    <span
                      className={`font-bold text-sm sm:text-base ${getSeverityColor(latePaymentMonths)}`}
                    >
                      +{formatCurrency(latePaymentInfo.totalPenalty)} {currency}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-2 sm:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        {t("latePayment.totalDue")}:
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold ${getSeverityColor(latePaymentMonths)}`}
                      >
                        {formatCurrency(latePaymentInfo.totalOwed)} {currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Warning for 6+ months */}
                {latePaymentInfo.isCollectable && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-1">
                          {t("latePayment.criticalWarning")}
                        </p>
                        <p className="text-sm">
                          {t("latePayment.criticalText")}
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
                      {t("latePayment.generalWarning")}
                      {latePaymentMonths >= 3 &&
                        ` ${t("latePayment.creditBureauWarning")}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-700 text-sm">
                {submitError}
              </div>
            )}
          </div>

          {/* Trust indicators */}
          <TrustBadge />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/25 backdrop-blur-xs border-t border-gray-200 shadow-lg px-4 py-4 z-50">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="py-2 px-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{tCommon("back")}</span>
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || isSubmitting}
            className={`w-full py-2 px-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
              canContinue && !isSubmitting
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{tCommon("loading")}</span>
              </>
            ) : (
              <>
                <span>{t("submitButton")}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep2;
