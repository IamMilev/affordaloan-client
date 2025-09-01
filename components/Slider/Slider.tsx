"use client";
import type React from "react";

import { useCallback, useState } from "react";

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Convert percentage back to value for slider input
const getValueFromPercentage = (
  percentage: number,
  min: number,
  max: number,
  breakPoint1: number,
  breakPoint2: number,
) => {
  if (percentage <= 33.33) {
    // First tier
    const tierProgress = percentage / 33.33;
    return min + tierProgress * (breakPoint1 - min);
  } else if (percentage <= 66.66) {
    // Second tier
    const tierProgress = (percentage - 33.33) / 33.33;
    return breakPoint1 + tierProgress * (breakPoint2 - breakPoint1);
  } else {
    // Third tier
    const tierProgress = (percentage - 66.66) / 33.34;
    return breakPoint2 + tierProgress * (max - breakPoint2);
  }
};

// Get the nearest valid step value
const getNearestStepValue = (
  val: number,
  min: number,
  max: number,
  breakPoint1: number,
  breakPoint2: number,
) => {
  val = Math.max(min, Math.min(max, val)); // Clamp to range

  if (val <= breakPoint1) {
    return Math.round(val / 1000) * 1000;
  } else if (val <= breakPoint2) {
    const excess = val - breakPoint1;
    const roundedExcess = Math.round(excess / 2000) * 2000;
    return breakPoint1 + roundedExcess;
  } else {
    const excess = val - breakPoint2;
    const roundedExcess = Math.round(excess / 5000) * 5000;
    return breakPoint2 + roundedExcess;
  }
};

const CustomRangeSlider = () => {
  const [value, setValue] = useState(50000);
  const [inputValue, setInputValue] = useState("50,000");
  const [_, setIsEditing] = useState(false);

  const min = 5000;
  const max = 350000;
  const breakPoint1 = 100000;
  const breakPoint2 = 200000;

  // Remove commas and parse number
  const parseNumber = (str: string) => {
    return parseInt(str.replace(/,/g, ""), 10); // Added radix 10
  };

  // Get the appropriate step size for a given value
  const getStepSize = (val: number) => {
    if (val <= breakPoint1) return 1000;
    if (val <= breakPoint2) return 2000;
    return 5000;
  };

  // Generate all possible values for the range input
  const generateValidValues = () => {
    const values = [];

    // From 5k to 100k in 1k steps
    for (let i = min; i <= breakPoint1; i += 1000) {
      values.push(i);
    }

    // From 100k to 200k in 2k steps
    for (let i = breakPoint1 + 2000; i <= breakPoint2; i += 2000) {
      values.push(i);
    }

    // From 200k to 350k in 5k steps
    for (let i = breakPoint2 + 5000; i <= max; i += 5000) {
      values.push(i);
    }

    return values;
  };

  const validValues = generateValidValues();

  // Calculate percentage for proportional positioning
  const getPercentage = (val: number) => {
    if (val <= breakPoint1) {
      // First tier: 0-33.33% of slider width
      const tierProgress = (val - min) / (breakPoint1 - min);
      return tierProgress * 33.33;
    } else if (val <= breakPoint2) {
      // Second tier: 33.33-66.66% of slider width
      const tierProgress = (val - breakPoint1) / (breakPoint2 - breakPoint1);
      return 33.33 + tierProgress * 33.33;
    } else {
      // Third tier: 66.66-100% of slider width
      const tierProgress = (val - breakPoint2) / (max - breakPoint2);
      return 66.66 + tierProgress * 33.34;
    }
  };

  // Get the closest valid value index for the current value
  // const getClosestValidIndex = (val: number) => {
  //   let closestIndex = 0;
  //   let closestDistance = Math.abs(validValues[0] - val);
  //
  //   for (let i = 1; i < validValues.length; i++) {
  //     const distance = Math.abs(validValues[i] - val);
  //     if (distance < closestDistance) {
  //       closestDistance = distance;
  //       closestIndex = i;
  //     }
  //   }
  //
  //   return closestIndex;
  // };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = (parseInt(e.target.value, 10) / 1000) * 100;
    const approximateValue = getValueFromPercentage(
      percentage,
      min,
      max,
      breakPoint1,
      breakPoint2,
    );
    const validValue = getNearestStepValue(
      approximateValue,
      min,
      max,
      breakPoint1,
      breakPoint2,
    );
    setValue(validValue);
    setInputValue(formatNumber(validValue));
  }, []);

  const handleStepClick = (stepValue: number) => {
    const validValue = getNearestStepValue(
      stepValue,
      min,
      max,
      breakPoint1,
      breakPoint2,
    );
    setValue(validValue);
    setInputValue(formatNumber(validValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numericValue = parseNumber(inputValue) || value;
    // Clamp to range but don't snap to step yet
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    setValue(clampedValue);
    setInputValue(formatNumber(clampedValue));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Changed to KeyboardEvent
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Generate step markers
  const generateSteps = () => {
    // const steps = [];

    // Manually define key step points that make sense for the 3-tier system
    const keySteps = [
      5000, 25000, 50000, 75000, 100000, 150000, 200000, 275000, 350000,
    ];

    return keySteps.map((step) =>
      getNearestStepValue(step, min, max, breakPoint1, breakPoint2),
    );
  };

  const steps = generateSteps();

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Amount</h2>

        {/* Editable input field */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-blue-600 pointer-events-none">
            $
          </span>
          <input
            id="loan-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-full pl-10 pr-4 py-3 text-3xl font-bold text-blue-600 bg-transparent border-2 border-transparent rounded-lg hover:border-blue-200 focus:border-blue-400 focus:outline-none transition-all duration-200"
            placeholder="Enter amount"
          />
        </div>

        {/* Step size indicator */}
        <p className="text-sm text-gray-500">
          Current step size: ${formatNumber(getStepSize(value))}
          <span className="ml-2 text-xs">
            (
            {value <= breakPoint1
              ? "≤$100k"
              : value <= breakPoint2
                ? "$100k-$200k"
                : ">$200k"}
            )
          </span>
          {!validValues.includes(value) && (
            <span className="ml-2 text-orange-600 text-xs font-medium">
              (Will snap to $
              {formatNumber(
                getNearestStepValue(value, min, max, breakPoint1, breakPoint2),
              )}{" "}
              when slider moves)
            </span>
          )}
        </p>
      </div>

      {/* Visual tier indicators */}
      <div className="relative mb-2">
        <div className="flex h-1 rounded-full overflow-hidden">
          <div className="w-1/3 bg-blue-200"></div>
          <div className="w-1/3 bg-green-200"></div>
          <div className="w-1/3 bg-purple-200"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$5k-$100k (1k steps)</span>
          <span>$100k-$200k (2k steps)</span>
          <span>$200k-$350k (5k steps)</span>
        </div>
      </div>

      <div className="relative mb-8">
        {/* Track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Progress fill */}
          <div
            className="absolute h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-200"
            style={{ width: `${getPercentage(value)}%` }}
          />

          {/* Thumb */}
          <div
            className="absolute w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg transform -translate-y-2 transition-all duration-200 hover:scale-110"
            style={{ left: `calc(${getPercentage(value)}% - 12px)` }}
          />
        </div>

        {/* Hidden input */}
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={getPercentage(value) * 10} // Convert 0-100% to 0-1000 for better precision
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>

      {/* Step markers */}
      <div className="relative mb-6">
        <div className="flex justify-between items-center">
          {steps.map((stepValue) => (
            <button
              type="button"
              key={stepValue}
              onClick={() => handleStepClick(stepValue)}
              className={`flex flex-col items-center group transition-all duration-200 ${
                value === stepValue ? "text-blue-600" : "text-gray-500"
              } hover:text-blue-700`}
            >
              {/* Step dot */}
              <div
                className={`w-3 h-3 rounded-full mb-2 transition-all duration-200 ${
                  value === stepValue
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 group-hover:bg-blue-400"
                }`}
              />

              {/* Step label */}
              <span className="text-xs font-medium whitespace-nowrap">
                ${formatNumber(stepValue / 1000)}k
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[25000, 50000, 100000, 200000].map((quickValue) => (
          <button
            type="button"
            key={quickValue}
            onClick={() => handleStepClick(quickValue)}
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              value === quickValue
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
            }`}
          >
            ${formatNumber(quickValue / 1000)}k
          </button>
        ))}
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>${formatNumber(min)}</span>
        <span>${formatNumber(max)}</span>
      </div>

      {/* Output for debugging */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Selected Value:{" "}
          <span className="font-mono font-bold">${formatNumber(value)}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Range: ${formatNumber(min)} - ${formatNumber(max)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Steps: $1k (≤$100k) → $2k ($100k-$200k) → $5k ({">"}$200k)
        </p>
      </div>
    </div>
  );
};

export default CustomRangeSlider;
