// app/[locale]/page.tsx (SERVER)
import type { LoanStatsResponse } from "@/types/api";
import LoanCalculatorFlow from "@/components/LoanCalculatorFlow/LoanCalculatorFlow";
import type { InterestRates } from "@/types/loan";
import type { Locale } from "@/i18n/config";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";
  const response = await fetch(`${backendUrl}/api/stats`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load stats");
  }

  const data: LoanStatsResponse = await response.json();

  const interestRates = data.reduce<InterestRates>(
    (acc, { loan_type, average_apr }) => {
      const result = {
        mortgage: acc.mortgage,
        consumer: acc.consumer,
      };

      if (loan_type === "mortgage") {
        result.mortgage = average_apr;
      } else if (loan_type === "consumer") {
        result.consumer = average_apr;
      }

      return result;
    },
    {
      mortgage: 0,
      consumer: 0,
    },
  );

  return (
    <div>
      <LoanCalculatorFlow interestRates={interestRates} locale={locale} />
    </div>
  );
}
