import type React from "react";
import { useTranslations } from "next-intl";

interface TrustBadgeProps {
  className?: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ className = "" }) => {
  const t = useTranslations("trust");

  return (
    <div className={`mt-8 text-center ${className}`}>
      <p className="text-sm text-gray-500 mb-2">
        <span className="inline-flex items-center">
          {/* Privacy Policy Link */}
          <a
            type="button"
            href="/privacy-policy.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-gray-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            aria-label="Open Privacy Policy"
          >
            {t("privacyPolicy")}
          </a>
        </span>
        {" | "}
        {/* Accurate Calculations */}
        <span>{t("accurateCalculations")}</span>
        {" | "}
        {/* Fast Result */}
        <span>{t("fastResult")}</span>
      </p>
    </div>
  );
};

export default TrustBadge;
