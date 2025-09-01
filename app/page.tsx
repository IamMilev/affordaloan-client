import CustomRangeSlider from "@/components/Slider/Slider";
import type { LoanStatsResponse } from "@/types/api";

export default async function HomePage() {
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
        <CustomRangeSlider />
      </div>
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div>Error loading stats</div>;
  }
}
