import type { LoanStatsResponse } from "@/types/api";
import LoanCalculatorStep1 from "@/components/LoanCalculatorStep1/LoanCalculatorStep1";
import type { LoanData } from "@/types/loan";

export default async function HomePage() {
  const handleStep1Complete = (data: LoanData) => {
    console.log("Step 1 completed with:", data);
    // Here you would navigate to Step 2 or store data
    // For now, just log the data
  };

  try {
    const response = await fetch("http://localhost:3000/api/stats", {
      // Add cache options if needed
      cache: "no-store", // or 'force-cache' for static data
    });

    if (!response.ok) {
      throw new Error(`API call failed! Status: ${response.status}`);
    }

    const data: LoanStatsResponse = await response.json();
    console.log(data);

    return (
      <div>
        {data.map((item) => `${item.loan_type}:  ${item.average_apr}; `)}
        <LoanCalculatorStep1
          useIncomeSlider={false} // Set to true if you want income as slider
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div>Error loading stats</div>;
  }
}
