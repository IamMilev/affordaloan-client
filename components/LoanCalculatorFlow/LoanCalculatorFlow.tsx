"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import LoanCalculatorStep1 from "@/components/LoanCalculatorStep1/LoanCalculatorStep1";
import type { LoanData, InterestRates, UserContactData } from "@/types/loan";
import type { Locale } from "@/i18n/config";
import LoanCalculatorStep2 from "../LoanCalculatorStep2/LoanCalculatorStep2";
import LoanCalculatorStep3 from "../LoanCalculatorStep3/LoanCalculatorStep3";

const STORAGE_KEY = "affordaloan-wizard-state";

interface PersistedState {
  loanData: LoanData | null;
  userContact: UserContactData | null;
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

interface LoanCalculatorFlowProps {
  interestRates: InterestRates;
  locale: Locale;
}

export default function LoanCalculatorFlow({
  interestRates,
  locale,
}: LoanCalculatorFlowProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStepState] = useState(1);
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [userContact, setUserContact] = useState<UserContactData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // On mount, restore state from localStorage
  useEffect(() => {
    if (!isInitialized) {
      const urlStep = parseInt(searchParams.get("step") || "1", 10);
      const saved = loadState();

      if (saved?.loanData && urlStep > 1) {
        // Restore persisted data and allow staying on the URL step
        setLoanData(saved.loanData);
        if (saved.userContact) setUserContact(saved.userContact);

        if (urlStep === 2 && saved.loanData) {
          setStepState(2);
        } else if (urlStep === 3 && saved.loanData && saved.userContact) {
          setStepState(3);
        } else {
          // Data insufficient for requested step, go to step 1
          const params = new URLSearchParams(searchParams.toString());
          params.delete("step");
          const newUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;
          router.replace(newUrl);
        }
      } else if (urlStep > 1) {
        // No saved data, redirect to step 1
        const params = new URLSearchParams(searchParams.toString());
        params.delete("step");
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, searchParams, pathname, router]);

  // Update step when URL changes (browser back/forward) - only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const newStep = parseInt(searchParams.get("step") || "1", 10);
    if (newStep >= 1 && newStep <= 3 && newStep !== step) {
      // Only allow going back, or forward if we have the required data
      if (
        newStep < step ||
        (newStep === 2 && loanData) ||
        (newStep === 3 && loanData && userContact)
      ) {
        setStepState(newStep);
      } else if (newStep > step) {
        // If trying to go forward without data, redirect back to current step
        const params = new URLSearchParams(searchParams.toString());
        if (step === 1) {
          params.delete("step");
        } else {
          params.set("step", step.toString());
        }
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl);
      }
    }
  }, [
    isInitialized,
    searchParams,
    step,
    loanData,
    userContact,
    pathname,
    router,
  ]);

  // Custom setStep that updates URL
  const setStep = useCallback(
    (newStep: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", newStep.toString());
      router.push(`${pathname}?${params.toString()}`);
      setStepState(newStep);
    },
    [searchParams, pathname, router],
  );

  const handleStepComplete = (data: LoanData, newStep: number) => {
    setLoanData(data);
    saveState({ loanData: data, userContact });
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
        locale,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save user data");
    }

    setLoanData(data);
    setUserContact(contact);
    saveState({ loanData: data, userContact: contact });
    setStep(3);
  };

  return (
    <>
      {step === 1 && (
        <LoanCalculatorStep1
          useIncomeSlider
          onContinue={handleStepComplete}
          initialData={loanData}
        />
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
