// app/page.tsx (SERVER)
import type { LoanStatsResponse } from "@/types/api";
import LoanCalculatorFlow from "@/components/LoanCalculatorFlow/LoanCalculatorFlow";
import { InterestRates } from "@/types/loan";

export default async function HomePage() {
  const response = await fetch("http://localhost:3000/api/stats", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load stats");
  }

  const data: LoanStatsResponse = await response.json();

  const interestRates = data.reduce<InterestRates>(
    (acc, { loan_type, average_apr }) => {
      return {
        ...acc,
        [loan_type]: average_apr,
      };
    },
    {
      mortgage: 0,
      consumer: 0,
    },
  );

  return (
    <div>
      <LoanCalculatorFlow interestRates={interestRates} />
    </div>
  );
}
