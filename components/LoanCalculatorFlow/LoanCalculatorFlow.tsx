"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import LoanCalculatorStep1 from "@/components/LoanCalculatorStep1/LoanCalculatorStep1";
import type { LoanData, InterestRates, UserContactData } from "@/types/loan";
import LoanCalculatorStep2 from "../LoanCalculatorStep2/LoanCalculatorStep2";
import LoanCalculatorStep3 from "../LoanCalculatorStep3/LoanCalculatorStep3";

interface LoanCalculatorFlowProps {
  interestRates: InterestRates;
}

export default function LoanCalculatorFlow({
  interestRates,
}: LoanCalculatorFlowProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get step from URL, default to 1
  const urlStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStepState] = useState(urlStep >= 1 && urlStep <= 3 ? urlStep : 1);
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [userContact, setUserContact] = useState<UserContactData | null>(null);

  // Update step when URL changes (browser back/forward)
  useEffect(() => {
    const newStep = parseInt(searchParams.get("step") || "1", 10);
    if (newStep >= 1 && newStep <= 3 && newStep !== step) {
      // Only allow going back, or forward if we have the required data
      if (newStep < step || (newStep === 2 && loanData) || (newStep === 3 && loanData && userContact)) {
        setStepState(newStep);
      } else if (newStep > step) {
        // If trying to go forward without data, redirect back to current step
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", step.toString());
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  }, [searchParams, step, loanData, userContact, pathname, router]);

  // Custom setStep that updates URL
  const setStep = useCallback((newStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", newStep.toString());
    router.push(`${pathname}?${params.toString()}`);
    setStepState(newStep);
  }, [searchParams, pathname, router]);

  const handleStepComplete = (data: LoanData, newStep: number) => {
    setLoanData(data);
    setStep(newStep);
  };

  const handleStep2Complete = async (
    data: LoanData,
    contact: UserContactData,
  ) => {
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

    setLoanData(data);
    setUserContact(contact);
    setStep(3);
  };

  return (
    <>
      {step === 1 && (
        <LoanCalculatorStep1 useIncomeSlider onContinue={handleStepComplete} />
      )}

      {step === 2 && loanData && (
        <LoanCalculatorStep2
          loanData={loanData}
          onComplete={handleStep2Complete}
          setStep={setStep}
          interestRates={interestRates}
        />
      )}

      {step === 3 && loanData && (
        <LoanCalculatorStep3
          loanData={loanData}
          userName={userContact?.name}
          setStep={setStep}
          interestRates={interestRates}
        />
      )}
    </>
  );
}
