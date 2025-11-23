interface Step {
  number: number;
  label: string;
  active: boolean;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 3,
}) => {
  const steps: Step[] = [
    { number: 1, label: "Основна информация", active: currentStep >= 1 },
    { number: 2, label: "Детайли", active: currentStep >= 2 },
    { number: 3, label: "Резултат", active: currentStep >= 3 },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step.active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 mx-4 rounded ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
