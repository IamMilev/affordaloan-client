import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoanCalculatorStep2 from "./LoanCalculatorStep2";
import type { LoanData, InterestRates } from "@/types/loan";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => {
    const translations: Record<string, Record<string, string>> = {
      step2: {
        title: "Additional Information",
        subtitle: "Help us calculate",
        "contact.title": "Your Details",
        "contact.description": "We'll send you analysis",
        "contact.name": "Name",
        "contact.email": "Email",
        "contact.phone": "Phone",
        "contact.namePlaceholder": "Your name",
        "contact.emailPlaceholder": "example@email.com",
        "contact.phonePlaceholder": "+359 88 888 8888",
        "contact.emailError": "Please enter a valid email address",
        "contact.privacyNote": "Your data is protected",
        "debt.title": "Debt",
        "debt.label": "Debt",
        "debt.description": "Other loans",
        "debt.change": "Change",
        "debt.confirm": "Confirm",
        "monthlyExpenses.interestRate": "Interest Rate",
        "monthlyExpenses.title": "Monthly Expenses",
        "monthlyExpenses.payment": "Monthly payment",
        "monthlyExpenses.otherDebts": "Other Debts",
        "monthlyExpenses.term": "Term",
        "monthlyExpenses.rateSource": "Average rate",
        "monthlyExpenses.customRate": "Custom rate",
        "monthlyExpenses.editRate": "Edit",
        "monthlyExpenses.resetRate": "Reset",
        "monthlyExpenses.rateValidation": "Rate validation",
        "property.title": "Property Value",
        "property.description": "Market value",
        "property.change": "Change",
        "property.confirm": "Confirm",
        "upfrontCosts.title": "Upfront Costs",
        "upfrontCosts.downPayment": "Down Payment",
        "upfrontCosts.notaryFees": "Notary Fees",
        "upfrontCosts.insurance": "Insurance",
        "upfrontCosts.municipalityFee": "Municipality Fee",
        "latePayment.title": "Late Payment",
        "latePayment.description": "See how much",
        "latePayment.monthsLabel": "Months late",
        "latePayment.penalty": "Penalty",
        "latePayment.totalDue": "Total due",
        "latePayment.criticalWarning": "CRITICAL",
        "latePayment.criticalText": "Critical text",
        "latePayment.generalWarning": "General warning",
        "latePayment.creditBureauWarning": "Credit bureau",
        submitButton: "View Results",
      },
      common: {
        back: "Back",
        loading: "Loading...",
        error: "Error",
        currency: "€",
        months: "months",
        month: "month",
      },
    };
    return (key: string) => translations[ns]?.[key] ?? key;
  },
}));

// Mock child components to simplify rendering
vi.mock("@/components/ProgressIndicator/ProgressIndicator", () => ({
  default: () => <div data-testid="progress-indicator" />,
}));

vi.mock("@/components/Slider/Slider", () => ({
  default: ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div data-testid={`slider-${label}`}>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}>
        increment
      </button>
    </div>
  ),
}));

vi.mock("../TrustBadge/TrustBadge", () => ({
  default: () => <div data-testid="trust-badge" />,
}));

const defaultLoanData: LoanData = {
  loanType: "consumer",
  income: "3000",
  loanAmount: 50000,
  term: 60,
};

const defaultInterestRates: InterestRates = {
  mortgage: 3.5,
  consumer: 8.0,
};

const defaultProps = {
  loanData: defaultLoanData,
  setStep: vi.fn(),
  interestRates: defaultInterestRates,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("LoanCalculatorStep2 - Phone field", () => {
  it("renders the phone input field", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
  });

  it("renders phone input with correct type and placeholder", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute("type", "tel");
  });

  it("phone field is not required (no asterisk)", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    const phoneLabel = screen.getByText("Phone");
    // The parent label should NOT contain an asterisk span (unlike Name and Email)
    const labelContainer = phoneLabel.closest("label");
    expect(labelContainer?.textContent).not.toContain("*");
  });

  it("updates phone value on user input", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    fireEvent.change(phoneInput, { target: { value: "+359888123456" } });
    expect(phoneInput).toHaveValue("+359888123456");
  });

  it("renders phone input next to name input (in same grid row)", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText("Your name");
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    // Both should share the same grid parent
    const nameContainer = nameInput.closest(".grid");
    const phoneContainer = phoneInput.closest(".grid");
    expect(nameContainer).toBe(phoneContainer);
    expect(nameContainer).not.toBeNull();
  });

  it("persists phone to localStorage when changed", async () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    fireEvent.change(phoneInput, { target: { value: "+359888123456" } });

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem("affordaloan-step2-state") || "{}",
      );
      expect(stored.contactPhone).toBe("+359888123456");
    });
  });

  it("restores phone from localStorage on mount", () => {
    localStorage.setItem(
      "affordaloan-step2-state",
      JSON.stringify({
        activeDebt: 0,
        propertyValue: 0,
        customRate: null,
        contactName: "John",
        contactEmail: "john@test.com",
        contactPhone: "+359888999000",
        latePaymentMonths: 1,
      }),
    );

    render(<LoanCalculatorStep2 {...defaultProps} />);
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    expect(phoneInput).toHaveValue("+359888999000");
  });

  it("passes phone in contact data when form is submitted", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    render(
      <LoanCalculatorStep2 {...defaultProps} onComplete={onComplete} />,
    );

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("example@email.com");
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+359888123456" } });

    const submitButton = screen.getByText("View Results");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    const [, contactArg] = onComplete.mock.calls[0];
    expect(contactArg.phone).toBe("+359888123456");
  });

  it("submits successfully without phone (optional field)", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    render(
      <LoanCalculatorStep2 {...defaultProps} onComplete={onComplete} />,
    );

    const nameInput = screen.getByPlaceholderText("Your name");
    const emailInput = screen.getByPlaceholderText("example@email.com");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByText("View Results");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    const [, contactArg] = onComplete.mock.calls[0];
    expect(contactArg.phone).toBe("");
  });

  it("does not affect form validation (name + email still required)", () => {
    render(<LoanCalculatorStep2 {...defaultProps} />);

    // Only phone filled, no name or email - button should be disabled
    const phoneInput = screen.getByPlaceholderText("+359 88 888 8888");
    fireEvent.change(phoneInput, { target: { value: "+359888123456" } });

    const submitButton = screen.getByText("View Results").closest("button")!;
    expect(submitButton).toBeDisabled();
  });
});
