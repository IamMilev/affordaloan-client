"use client";

import { useCallback, useState, useMemo, useRef } from "react";
import type React from "react";

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
    const tierProgress = percentage / 33.33;
    return min + tierProgress * (breakPoint1 - min);
  } else if (percentage <= 66.66) {
    const tierProgress = (percentage - 33.33) / 33.33;
    return breakPoint1 + tierProgress * (breakPoint2 - breakPoint1);
  } else {
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
  val = Math.max(min, Math.min(max, val));

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(50000);

  // Use ref to track if we're in the middle of a drag operation
  const dragTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const min = 5000;
  const max = 350000;
  const breakPoint1 = 100000;
  const breakPoint2 = 200000;

  // Memoize constants that don't change
  const validValues = useMemo(() => {
    const values = [];

    for (let i = min; i <= breakPoint1; i += 1000) {
      values.push(i);
    }
    for (let i = breakPoint1 + 2000; i <= breakPoint2; i += 2000) {
      values.push(i);
    }
    for (let i = breakPoint2 + 5000; i <= max; i += 5000) {
      values.push(i);
    }

    return values;
  }, []);

  const steps = useMemo(() => {
    const keySteps = [
      5000, 25000, 50000, 75000, 100000, 150000, 200000, 275000, 350000,
    ];
    return keySteps.map((step) =>
      getNearestStepValue(step, min, max, breakPoint1, breakPoint2),
    );
  }, []);

  // Memoize expensive calculations - use dragValue when dragging, otherwise use value
  const currentPercentage = useMemo(() => {
    const currentValue = isDragging ? dragValue : value;
    if (currentValue <= breakPoint1) {
      const tierProgress = (currentValue - min) / (breakPoint1 - min);
      return tierProgress * 33.33;
    } else if (currentValue <= breakPoint2) {
      const tierProgress =
        (currentValue - breakPoint1) / (breakPoint2 - breakPoint1);
      return 33.33 + tierProgress * 33.33;
    } else {
      const tierProgress = (currentValue - breakPoint2) / (max - breakPoint2);
      return 66.66 + tierProgress * 33.34;
    }
  }, [value, dragValue, isDragging]);

  const currentStepSize = useMemo(() => {
    const currentValue = isDragging ? dragValue : value;
    if (currentValue <= breakPoint1) return 1000;
    if (currentValue <= breakPoint2) return 2000;
    return 5000;
  }, [value, dragValue, isDragging]);

  // Parse number function
  const parseNumber = useCallback((str: string) => {
    return parseInt(str.replace(/,/g, ""), 10);
  }, []);

  // Optimized change handler with reduced calculations during drag
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDragging) {
        setIsDragging(true);
      }

      const percentage = (parseInt(e.target.value, 10) / 1000) * 100;
      const approximateValue = getValueFromPercentage(
        percentage,
        min,
        max,
        breakPoint1,
        breakPoint2,
      );

      // During drag, only update dragValue for smooth visual movement
      const validValue = getNearestStepValue(
        approximateValue,
        min,
        max,
        breakPoint1,
        breakPoint2,
      );

      setDragValue(validValue);
      // Update input value live during dragging
      setInputValue(formatNumber(validValue));

      // Clear any existing timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Set a timeout to commit the value after drag ends
      dragTimeoutRef.current = setTimeout(() => {
        setValue(validValue);
        setIsDragging(false);
      }, 150); // Small delay to ensure drag has ended
    },
    [isDragging],
  );

  const handleStepClick = useCallback((stepValue: number) => {
    const validValue = getNearestStepValue(
      stepValue,
      min,
      max,
      breakPoint1,
      breakPoint2,
    );
    setValue(validValue);
    setDragValue(validValue);
    setInputValue(formatNumber(validValue));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(value.toString());
  }, [value]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const numericValue = parseNumber(inputValue) || value;
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    setValue(clampedValue);
    setDragValue(clampedValue);
    setInputValue(formatNumber(clampedValue));
  }, [inputValue, value, parseNumber]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    [],
  );

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
          Current step size: ${formatNumber(currentStepSize)}
          <span className="ml-2 text-xs">
            (
            {(isDragging ? dragValue : value) <= breakPoint1
              ? "≤$100k"
              : (isDragging ? dragValue : value) <= breakPoint2
                ? "$100k-$200k"
                : ">$200k"}
            )
          </span>
          {!isDragging && !validValues.includes(value) && (
            <span className="ml-2 text-orange-600 text-xs font-medium">
              (Will snap to $
              {formatNumber(
                getNearestStepValue(value, min, max, breakPoint1, breakPoint2),
              )}{" "}
              when slider moves)
            </span>
          )}
          {isDragging && (
            <span className="ml-2 text-blue-600 text-xs font-medium">
              (Dragging...)
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
          {/* Progress fill - using transform instead of width for better performance */}
          <div
            className="absolute h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full will-change-transform"
            style={{
              transform: `scaleX(${currentPercentage / 100})`,
              transformOrigin: "left",
              width: "100%",
            }}
          />

          {/* Thumb - using transform for positioning */}
          <div
            className="absolute w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg will-change-transform transition-transform duration-75 hover:scale-110"
            style={{
              left: `calc(${currentPercentage}% - 12px)`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Hidden input with optimized range */}
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={currentPercentage * 10}
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
              className={`flex flex-col items-center group transition-colors duration-200 ${
                value === stepValue ? "text-blue-600" : "text-gray-500"
              } hover:text-blue-700`}
            >
              <div
                className={`w-3 h-3 rounded-full mb-2 transition-all duration-200 ${
                  value === stepValue
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 group-hover:bg-blue-400"
                }`}
              />
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
          <span className="font-mono font-bold">
            ${formatNumber(Math.round(isDragging ? dragValue : value))}
          </span>
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
