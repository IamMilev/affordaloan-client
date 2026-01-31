"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import ProgressIndicator from "@/components/ProgressIndicator/ProgressIndicator";
import type { ContactData, LoanData, InterestRates } from "@/types/loan";
import LoanPreviewCard from "../LoanPreviewCard/LoanPreviewCard";

function canSubmitContactForm(contactData: ContactData): boolean {
  const hasName = contactData.name.trim().length > 0;
  if (!hasName) return false;

  const hasEmail = contactData.email.trim().length > 0;
  const hasPhone = contactData.phone.trim().length > 0;

  switch (contactData.contactMethod) {
    case "email":
      return hasEmail;

    case "phone":
      return hasPhone;

    case "both":
      return hasEmail || hasPhone;

    default:
      return false; // exhaustive safety
  }
}

interface LoanCalculatorStep3Props {
  loanData: LoanData;
  onBack?: () => void;
  onSubmit?: (loanData: LoanData, contactData: ContactData) => Promise<void>;
  setStep: (step: number) => void;
  interestRates: InterestRates;
}

const LoanCalculatorStep3: React.FC<LoanCalculatorStep3Props> = ({
  loanData,
  onSubmit,
  setStep,
  interestRates,
}) => {
  const { mortgage, consumer } = interestRates;
  const [contactData, setContactData] = useState<ContactData>({
    name: "",
    email: "",
    phone: "",
    city: "",
    contactMethod: "both",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    let message: string;
    let advice: string[];

    if (dti <= 30) {
      recommendation = "excellent";
      message = "Отлично! Този кредит е напълно по силите ти.";
      advice = [
        "Месечната вноска е под 30% от доходите ти - това е идеално съотношение",
        "Ще имаш достатъчно средства за спестявания и непредвидени разходи",
        "Банката с голяма вероятност ще одобри този кредит",
        "Можеш да помислиш и за по-кратък срок, за да намалиш лихвите",
      ];
    } else if (dti <= 40) {
      recommendation = "good";
      message = "Добре! Този кредит е разумен избор за теб.";
      advice = [
        "Месечната вноска е между 30-40% от доходите ти - приемливо съотношение",
        "Ще можеш удобно да си плащаш вноските",
        "Препоръчваме да имаш резервен фонд за непредвидени ситуации",
        "Внимавай с допълнителни кредити през този период",
      ];
    } else if (dti <= 50) {
      recommendation = "risky";
      message = "Внимание! Този кредит може да е предизвикателство.";
      advice = [
        "Месечната вноска е между 40-50% от доходите ти - това е рисковано",
        "Ще имаш ограничени средства за други разходи",
        "Помисли за увеличаване на срока или намаляване на сумата",
        "Уверена, че няма да има промени в доходите ти?",
        "Банката може да изиска допълнителни обезпечения",
      ];
    } else {
      recommendation = "notRecommended";
      message = "Не препоръчваме! Този кредит е твърде рискован.";
      advice = [
        "Месечната вноска е над 50% от доходите ти - това е много високо",
        "Голям риск от неплащане и финансови проблеми",
        "Банката най-вероятно ще отхвърли заявката",
        "Помисли за намаляване на сумата или удължаване на срока",
        "Или опитай да увеличиш доходите си преди да кандидатстваш",
      ];
    }

    return {
      dti,
      recommendation,
      message,
      advice,
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
        return "text-orange-700";
      case "notRecommended":
        return "text-red-700";
    }
  };

  const getRecommendationBg = () => {
    switch (analysis.recommendation) {
      case "excellent":
        return "from-green-50 to-green-100 border-green-300";
      case "good":
        return "from-blue-50 to-blue-100 border-blue-300";
      case "risky":
        return "from-orange-50 to-orange-100 border-orange-300";
      case "notRecommended":
        return "from-red-50 to-red-100 border-red-300";
    }
  };

  const getRecommendationIcon = () => {
    switch (analysis.recommendation) {
      case "excellent":
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case "good":
        return <CheckCircle className="w-12 h-12 text-blue-600" />;
      case "risky":
        return <AlertCircle className="w-12 h-12 text-orange-600" />;
      case "notRecommended":
        return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const canSubmit = canSubmitContactForm(contactData);
  const handleBack = () => {
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (onSubmit) {
        await onSubmit(loanData, contactData);
      }
      setIsSubmitted(true);
    } catch {
      setSubmitError("Възникна грешка при изпращането. Моля, опитай отново.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Благодарим ти!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Получихме твоята заявка и скоро ще се свържем с теб.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-700 mb-2">Ще те потърсим на:</p>
              <p className="font-semibold text-gray-900">{contactData.name}</p>
              {contactData.email && (
                <p className="text-gray-700">{contactData.email}</p>
              )}
              {contactData.phone && (
                <p className="text-gray-700">{contactData.phone}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Очаквай обаждане в рамките на 1-2 работни дни
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={3} />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Анализ и препоръка
            </h1>
            <p className="text-gray-600">
              Ето какво установихме за твоята ситуация
            </p>
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
              <p className="text-sm text-gray-600 mb-1">Сума на кредита</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(loanData.loanAmount)} лв.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Процент от дохода</p>
              <p className="text-2xl font-bold text-indigo-600">
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
              Нашата препоръка
            </h2>

            <div
              className={`rounded-xl p-6 border-2 bg-gradient-to-br ${getRecommendationBg()}`}
            >
              <div className="flex items-start mb-4">
                <div className="mr-4 flex-shrink-0">
                  {getRecommendationIcon()}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-2xl font-bold mb-2 ${getRecommendationColor()}`}
                  >
                    {analysis.message}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Месечната вноска ще бъде{" "}
                    <span className="font-bold">
                      {formatCurrency(analysis.totalMonthlyDebt)} лв.
                    </span>{" "}
                    от твоите{" "}
                    <span className="font-bold">
                      {formatCurrency(analysis.monthlyIncome)} лв.
                    </span>{" "}
                    доход
                    {loanData.activeDebt &&
                      ` (включително ${formatCurrency(loanData.activeDebt || 0)} лв. активни задължения)`}
                    .
                  </p>

                  <div className="bg-white rounded-lg p-5">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Нашите съвети:
                    </h4>
                    <ul className="space-y-2">
                      {analysis.advice.map((item) => (
                        <li key={item} className="flex items-start">
                          <span className="text-blue-600 mr-2 flex-shrink-0">
                            •
                          </span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                2
              </span>
              Искаш ли да продължим?
            </h2>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Ще обсъдим заедно дали кредитът е правилното решение за теб,
                  как ще се отрази на месечния ти бюджет, какво би означавало
                  това за начина ти на живот и дали покупката е по-добра
                  алтернатива от наем.
                </p>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Име <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={contactData.name}
                      onChange={(e) =>
                        setContactData({ ...contactData, name: e.target.value })
                      }
                      placeholder="Вашето име"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contact Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Как да се свържем с теб?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setContactData({
                          ...contactData,
                          contactMethod: "email",
                        })
                      }
                      className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        contactData.contactMethod === "email"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border-2 border-gray-200"
                      }`}
                    >
                      Имейл
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setContactData({
                          ...contactData,
                          contactMethod: "phone",
                        })
                      }
                      className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        contactData.contactMethod === "phone"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border-2 border-gray-200"
                      }`}
                    >
                      Телефон
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setContactData({
                          ...contactData,
                          contactMethod: "both",
                        })
                      }
                      className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        contactData.contactMethod === "both"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border-2 border-gray-200"
                      }`}
                    >
                      И двете
                    </button>
                  </div>
                </div>

                {/* Email Input */}
                {(contactData.contactMethod === "email" ||
                  contactData.contactMethod === "both") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Имейл{" "}
                      {contactData.contactMethod === "both" ? (
                        ""
                      ) : (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={contactData.email}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            email: e.target.value,
                          })
                        }
                        placeholder="example@email.com"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Phone Input */}
                {(contactData.contactMethod === "phone" ||
                  contactData.contactMethod === "both") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Телефон{" "}
                      {contactData.contactMethod === "both" ? (
                        ""
                      ) : (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="0888 123 456"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* City Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Град
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={contactData.city}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          city: e.target.value,
                        })
                      }
                      placeholder="София"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Твоите данни са защитени и няма да бъдат споделяни с трети
                страни
              </p>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                canSubmit && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Изпращане...</span>
                </>
              ) : (
                <>
                  <span>Изпрати заявка</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            🔒 Данните ти са защитени | 📊 Безплатна консултация | ⚡ Бърз
            отговор
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep3;
