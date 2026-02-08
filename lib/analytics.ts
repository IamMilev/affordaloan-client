type GtagCommand = "config" | "event" | "js" | "set";

declare global {
  interface Window {
    gtag?: (...args: [GtagCommand, ...unknown[]]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackStepTransition(fromStep: number, toStep: number) {
  window.gtag?.("event", "step_transition", {
    from_step: fromStep,
    to_step: toStep,
  });

  window.fbq?.("trackCustom", "StepTransition", {
    from_step: fromStep,
    to_step: toStep,
  });
}

export function trackFormSubmission(loanType: string, loanAmount: number) {
  window.gtag?.("event", "generate_lead", {
    currency: "EUR",
    value: loanAmount,
    loan_type: loanType,
  });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (adsId && conversionLabel) {
    window.gtag?.("event", "conversion", {
      send_to: `${adsId}/${conversionLabel}`,
      currency: "EUR",
      value: loanAmount,
    });
  }

  window.fbq?.("track", "Lead", {
    currency: "EUR",
    value: loanAmount,
    content_name: loanType,
  });
}
