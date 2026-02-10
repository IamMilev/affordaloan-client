import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoanCalculatorFlow from "./LoanCalculatorFlow";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => "2",
    toString: () => "step=2",
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/bg",
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  trackStepTransition: vi.fn(),
  trackFormSubmission: vi.fn(),
}));

// Capture the onComplete callback from Step2
let capturedOnComplete: ((data: any, contact: any) => Promise<void>) | null =
  null;

vi.mock("@/components/LoanCalculatorStep1/LoanCalculatorStep1", () => ({
  default: () => <div data-testid="step1" />,
}));

vi.mock("../LoanCalculatorStep2/LoanCalculatorStep2", () => ({
  default: ({
    onComplete,
  }: {
    onComplete: (data: any, contact: any) => Promise<void>;
  }) => {
    capturedOnComplete = onComplete;
    return (
      <div data-testid="step2">
        <button
          type="button"
          data-testid="submit-step2"
          onClick={() =>
            onComplete(
              {
                loanType: "consumer",
                income: "3000",
                loanAmount: 50000,
                term: 60,
                activeDebt: 0,
                propertyValue: 0,
              },
              {
                name: "Test User",
                email: "test@example.com",
                phone: "+359888123456",
              },
            )
          }
        >
          Submit
        </button>
        <button
          type="button"
          data-testid="submit-step2-no-phone"
          onClick={() =>
            onComplete(
              {
                loanType: "consumer",
                income: "3000",
                loanAmount: 50000,
                term: 60,
                activeDebt: 0,
                propertyValue: 0,
              },
              {
                name: "Test User",
                email: "test@example.com",
                phone: "",
              },
            )
          }
        >
          Submit No Phone
        </button>
      </div>
    );
  },
}));

vi.mock("../LoanCalculatorStep3/LoanCalculatorStep3", () => ({
  default: () => <div data-testid="step3" />,
}));

const defaultProps = {
  interestRates: { mortgage: 3.5, consumer: 8.0 },
  locale: "bg" as const,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  capturedOnComplete = null;

  // Seed localStorage so Flow renders Step 2 (requires loanData for step=2)
  localStorage.setItem(
    "affordaloan-wizard-state",
    JSON.stringify({
      loanData: {
        loanType: "consumer",
        income: "3000",
        loanAmount: 50000,
        term: 60,
      },
      userContact: null,
    }),
  );

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

describe("LoanCalculatorFlow - phone in API payload", () => {
  it("sends phone in the user object when phone is provided", async () => {
    render(<LoanCalculatorFlow {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("submit-step2"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.user.phone).toBe("+359888123456");
  });

  it("omits phone from the user object when phone is empty", async () => {
    render(<LoanCalculatorFlow {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("step2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("submit-step2-no-phone"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    // Empty string gets converted to undefined via `contact.phone || undefined`
    // JSON.stringify strips undefined values
    expect(body.user.phone).toBeUndefined();
  });
});
