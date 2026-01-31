"use client";

import { useState } from "react";
import LoanCalculatorStep1 from "@/components/LoanCalculatorStep1/LoanCalculatorStep1";
import type { LoanData, InterestRates, ContactData } from "@/types/loan";
import LoanCalculatorStep2 from "../LoanCalculatorStep2/LoanCalculatorStep2";
import LoanCalculatorStep3 from "../LoanCalculatorStep3/LoanCalculatorStep3";

interface LoanCalculatorFlowProps {
  interestRates: InterestRates;
}

export default function LoanCalculatorFlow({
  interestRates,
}: LoanCalculatorFlowProps) {
  const [step, setStep] = useState(1);
  const [loanData, setLoanData] = useState<LoanData | null>(null);

  const handleStepComplete = (data: LoanData, step: number) => {
    setLoanData(data);
    setStep(step);
  };

  const handleSubmit = async (data: LoanData, contact: ContactData) => {
    const interestRate =
      data.loanType === "mortgage"
        ? interestRates.mortgage
        : interestRates.consumer;

    const response = await fetch("/api/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone || undefined,
          city: contact.city,
        },
        loanData: {
          loanType: data.loanType,
          loanAmount: data.loanAmount,
          netMonthlyIncome: parseFloat(data.income.replace(/,/g, "")),
          existingMonthlyDebt: data.activeDebt || 0,
          interestRate,
          loanTermYears: Math.round(data.term / 12),
          downPayment: data.propertyValue
            ? data.propertyValue - data.loanAmount
            : undefined,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save user data");
    }
  };

  return (
    <>
      {step === 1 && (
        <LoanCalculatorStep1 useIncomeSlider onContinue={handleStepComplete} />
      )}

      {step === 2 && loanData && (
        <LoanCalculatorStep2
          loanData={loanData}
          onContinue={handleStepComplete}
          setStep={setStep}
          interestRates={interestRates}
        />
      )}

      {step === 3 && loanData && (
        <LoanCalculatorStep3
          loanData={loanData}
          onSubmit={handleSubmit}
          setStep={setStep}
          interestRates={interestRates}
        />
      )}
    </>
  );
}
