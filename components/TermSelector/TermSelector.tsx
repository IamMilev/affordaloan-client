import { Calendar } from "lucide-react";

interface TermSelectorProps {
  term: number;
  onTermChange: (term: number) => void;
}

const TermSelector: React.FC<TermSelectorProps> = ({ term, onTermChange }) => {
  const termOptions = [
    { value: 5, label: "5 години" },
    { value: 10, label: "10 години" },
    { value: 15, label: "15 години" },
    { value: 20, label: "20 години" },
    { value: 25, label: "25 години" },
    { value: 30, label: "30 години" },
  ];

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTermChange(parseInt(e.target.value));
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
          4
        </span>
        Срок на погасяване
      </h2>
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <select
          value={term}
          onChange={handleTermChange}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white"
        >
          {termOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TermSelector;
