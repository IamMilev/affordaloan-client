"use client";

import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import type React from "react";

// New props interface for external control
interface CustomRangeSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  showSteps?: boolean;
  showQuickSelect?: boolean;
  showDebugInfo?: boolean;
  className?: string;
  valueTextSize?: string;
}

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

// Simple step calculation for external control
const getSimpleStepValue = (
  val: number,
  min: number,
  max: number,
  step: number,
) => {
  const steppedValue = Math.round((val - min) / step) * step + min;
  return Math.max(min, Math.min(max, steppedValue));
};

const CustomRangeSlider: React.FC<CustomRangeSliderProps> = ({
  value: externalValue,
  onChange: externalOnChange,
  min: externalMin,
  max: externalMax,
  step: externalStep,
  formatValue,
  showSteps = false,
  showQuickSelect = true,
  showDebugInfo = true,
  className = "",
  valueTextSize,
}) => {
  // Determine if we're in external control mode
  const isExternallyControlled =
    externalValue !== undefined && externalOnChange !== undefined;

  // Default values (original slider configuration)
  const defaultMin = 5000;
  const defaultMax = 350000;
  const defaultValue = 50000;

  // Use external props or defaults
  const min = externalMin ?? defaultMin;
  const max = externalMax ?? defaultMax;
  const step = externalStep ?? 1000;
  const initialValue = externalValue ?? defaultValue;

  // Internal state (used when not externally controlled)
  const [internalValue, setInternalValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(
    formatValue ? formatValue(initialValue) : formatNumber(initialValue),
  );
  const [_, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(initialValue);

  // Use ref to track if we're in the middle of a drag operation
  const dragTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Get current value (external or internal)
  const currentValue = isExternallyControlled ? externalValue : internalValue;

  // Update internal state when external value changes
  useEffect(() => {
    if (isExternallyControlled && externalValue !== undefined) {
      setInternalValue(externalValue);
      setDragValue(externalValue);
      const formatted = formatValue
        ? formatValue(externalValue)
        : formatNumber(externalValue);
      setInputValue(formatted);
    }
  }, [externalValue, formatValue, isExternallyControlled]);

  // Determine if we should use complex stepping (original behavior) or simple stepping
  const useComplexStepping =
    !isExternallyControlled && min === defaultMin && max === defaultMax;

  const breakPoint1 = useComplexStepping ? 100000 : min + (max - min) * 0.33;
  const breakPoint2 = useComplexStepping ? 200000 : min + (max - min) * 0.66;

  // Memoize valid values for complex stepping
  const validValues = useMemo(() => {
    if (!useComplexStepping) {
      // Simple stepping: generate values based on step
      const values = [];
      for (let i = min; i <= max; i += step) {
        values.push(i);
      }
      return values;
    }

    // Original complex stepping logic
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
  }, [min, max, step, useComplexStepping, breakPoint1, breakPoint2]);

  const steps = useMemo(() => {
    if (!showSteps) return [];

    if (!useComplexStepping) {
      // Simple steps: distribute evenly across range
      const stepCount = 8;
      const stepSize = (max - min) / (stepCount - 1);
      return Array.from(
        { length: stepCount },
        (_, i) => min + Math.round(stepSize * i),
      );
    }

    // Original complex steps
    const keySteps = [
      5000, 25000, 50000, 75000, 100000, 150000, 200000, 275000, 350000,
    ];
    return keySteps
      .filter((step) => step >= min && step <= max)
      .map((step) =>
        getNearestStepValue(step, min, max, breakPoint1, breakPoint2),
      );
  }, [min, max, showSteps, useComplexStepping, breakPoint1, breakPoint2]);

  // Calculate percentage for slider position
  const currentPercentage = useMemo(() => {
    const workingValue = isDragging ? dragValue : currentValue;

    if (!useComplexStepping) {
      // Simple percentage calculation
      return ((workingValue - min) / (max - min)) * 100;
    }

    // Original complex percentage calculation
    if (workingValue <= breakPoint1) {
      const tierProgress = (workingValue - min) / (breakPoint1 - min);
      return tierProgress * 33.33;
    } else if (workingValue <= breakPoint2) {
      const tierProgress =
        (workingValue - breakPoint1) / (breakPoint2 - breakPoint1);
      return 33.33 + tierProgress * 33.33;
    } else {
      const tierProgress = (workingValue - breakPoint2) / (max - breakPoint2);
      return 66.66 + tierProgress * 33.34;
    }
  }, [
    currentValue,
    dragValue,
    isDragging,
    min,
    max,
    useComplexStepping,
    breakPoint1,
    breakPoint2,
  ]);

  const currentStepSize = useMemo(() => {
    if (!useComplexStepping) return step;

    const workingValue = isDragging ? dragValue : currentValue;
    if (workingValue <= breakPoint1) return 1000;
    if (workingValue <= breakPoint2) return 2000;
    return 5000;
  }, [
    currentValue,
    dragValue,
    isDragging,
    useComplexStepping,
    step,
    breakPoint1,
    breakPoint2,
  ]);

  // Parse number function
  const parseNumber = useCallback((str: string) => {
    return parseInt(str.replace(/,/g, ""), 10);
  }, []);

  // Handle value updates
  const updateValue = useCallback(
    (newValue: number) => {
      const finalValue = useComplexStepping
        ? getNearestStepValue(newValue, min, max, breakPoint1, breakPoint2)
        : getSimpleStepValue(newValue, min, max, step);

      if (isExternallyControlled && externalOnChange) {
        externalOnChange(finalValue);
      } else {
        setInternalValue(finalValue);
      }

      setDragValue(finalValue);
      const formatted = formatValue
        ? formatValue(finalValue)
        : formatNumber(finalValue);
      setInputValue(formatted);
    },
    [
      isExternallyControlled,
      externalOnChange,
      formatValue,
      useComplexStepping,
      min,
      max,
      step,
      breakPoint1,
      breakPoint2,
    ],
  );

  // Optimized change handler with reduced calculations during drag
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDragging) {
        setIsDragging(true);
      }

      let approximateValue: number;

      if (useComplexStepping) {
        // Original complex calculation
        const percentage = (parseInt(e.target.value, 10) / 1000) * 100;
        approximateValue = getValueFromPercentage(
          percentage,
          min,
          max,
          breakPoint1,
          breakPoint2,
        );
      } else {
        // Simple linear calculation
        const sliderValue = parseInt(e.target.value, 10);
        const percentage = sliderValue / 1000; // Assuming slider max is 1000
        approximateValue = min + percentage * (max - min);
      }

      const validValue = useComplexStepping
        ? getNearestStepValue(
            approximateValue,
            min,
            max,
            breakPoint1,
            breakPoint2,
          )
        : getSimpleStepValue(approximateValue, min, max, step);

      setDragValue(validValue);
      const formatted = formatValue
        ? formatValue(validValue)
        : formatNumber(validValue);
      setInputValue(formatted);

      // Clear any existing timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Set a timeout to commit the value after drag ends
      dragTimeoutRef.current = setTimeout(() => {
        updateValue(validValue);
        setIsDragging(false);
      }, 150);
    },
    [
      isDragging,
      updateValue,
      formatValue,
      useComplexStepping,
      min,
      max,
      step,
      breakPoint1,
      breakPoint2,
    ],
  );

  const handleStepClick = useCallback(
    (stepValue: number) => {
      updateValue(stepValue);
    },
    [updateValue],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(currentValue.toString());
  }, [currentValue]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const numericValue = parseNumber(inputValue) || currentValue;
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    updateValue(clampedValue);
  }, [inputValue, currentValue, parseNumber, min, max, updateValue]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    [],
  );

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="mb-4">
        {/* Editable input field */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-blue-600 pointer-events-none">
            {formatValue ? "" : "$"}
          </span>
          <input
            id="loan-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className={`w-full ps-2 pl-10 pr-4 py-3 ${valueTextSize ? `text-${valueTextSize}` : "text-2xl"} font-bold text-blue-600 bg-transparent border-2 border-transparent rounded-lg hover:border-blue-200 focus:border-blue-400 focus:outline-none transition-all duration-200`}
            placeholder="Enter amount"
          />
        </div>

        {/* Step size indicator */}
        {showDebugInfo && (
          <p className="text-sm text-gray-500">
            Current step size:{" "}
            {formatValue
              ? formatValue(currentStepSize)
              : `$${formatNumber(currentStepSize)}`}
            <span className="ml-2 text-xs">
              (
              {useComplexStepping
                ? currentValue <= breakPoint1
                  ? "≤$100k"
                  : currentValue <= breakPoint2
                    ? "$100k-$200k"
                    : ">$200k"
                : `${formatValue ? formatValue(min) : `$${formatNumber(min)}`}-${formatValue ? formatValue(max) : `$${formatNumber(max)}`}`}
              )
            </span>
            {!isDragging && !validValues.includes(currentValue) && (
              <span className="ml-2 text-orange-600 text-xs font-medium">
                (Will snap to{" "}
                {formatValue
                  ? formatValue(
                      useComplexStepping
                        ? getNearestStepValue(
                            currentValue,
                            min,
                            max,
                            breakPoint1,
                            breakPoint2,
                          )
                        : getSimpleStepValue(currentValue, min, max, step),
                    )
                  : `$${formatNumber(
                      useComplexStepping
                        ? getNearestStepValue(
                            currentValue,
                            min,
                            max,
                            breakPoint1,
                            breakPoint2,
                          )
                        : getSimpleStepValue(currentValue, min, max, step),
                    )}`}{" "}
                when slider moves)
              </span>
            )}
            {isDragging && (
              <span className="ml-2 text-blue-600 text-xs font-medium">
                (Dragging...)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Visual tier indicators - only show for complex stepping */}
      {useComplexStepping && (
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
      )}

      <div className="relative mb-6">
        {/* Track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Progress fill */}
          <div
            className="absolute h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full will-change-transform"
            style={{
              transform: `scaleX(${currentPercentage / 100})`,
              transformOrigin: "left",
              width: "100%",
            }}
          />

          {/* Thumb */}
          <div
            className="absolute w-10 h-10 md:w-8 md:h-8 bg-white border-4 border-blue-500 rounded-full shadow-lg will-change-transform transition-transform duration-75 hover:scale-110 active:scale-95 z-20"
            style={{
              left: `${currentPercentage}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Hidden input with optimized range - expanded hit area for mobile */}
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={currentPercentage * 10}
          onChange={handleChange}
          className="absolute left-0 -top-7 w-full h-16 opacity-0 cursor-pointer z-30"
        />
        {/* Min/Max labels */}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <span>
            {formatValue ? formatValue(min) : `$${formatNumber(min)}`}
          </span>
          <span>
            {formatValue ? formatValue(max) : `$${formatNumber(max)}`}
          </span>
        </div>
      </div>

      {/* Step markers */}
      {showSteps && steps.length > 0 && (
        <div className="relative mb-6">
          <div className="flex justify-between items-center">
            {steps.map((stepValue) => (
              <button
                type="button"
                key={stepValue}
                onClick={() => handleStepClick(stepValue)}
                className={`flex flex-col items-center group transition-colors duration-200 ${
                  currentValue === stepValue ? "text-blue-600" : "text-gray-500"
                } hover:text-blue-700`}
              >
                <div
                  className={`w-3 h-3 rounded-full mb-2 transition-all duration-200 ${
                    currentValue === stepValue
                      ? "bg-blue-600 scale-125"
                      : "bg-gray-300 group-hover:bg-blue-400"
                  }`}
                />
                <span className="text-xs font-medium whitespace-nowrap">
                  {formatValue
                    ? formatValue(stepValue)
                    : `$${formatNumber(stepValue / 1000)}k`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick select buttons */}
      {showQuickSelect && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {(useComplexStepping
            ? [25000, 50000, 100000, 200000]
            : [
                min + (max - min) * 0.2,
                min + (max - min) * 0.4,
                min + (max - min) * 0.6,
                min + (max - min) * 0.8,
              ]
          ).map((quickValue) => (
            <button
              type="button"
              key={quickValue}
              onClick={() => handleStepClick(quickValue)}
              className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                currentValue === quickValue
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              {formatValue
                ? formatValue(quickValue)
                : `$${formatNumber(quickValue / 1000)}k`}
            </button>
          ))}
        </div>
      )}

      {/* Debug output */}
      {showDebugInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected Value:{" "}
            <span className="font-mono font-bold">
              {formatValue
                ? formatValue(Math.round(isDragging ? dragValue : currentValue))
                : `$${formatNumber(Math.round(isDragging ? dragValue : currentValue))}`}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Range:{" "}
            {formatValue
              ? `${formatValue(min)} - ${formatValue(max)}`
              : `$${formatNumber(min)} - $${formatNumber(max)}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Mode:{" "}
            {isExternallyControlled ? "External Control" : "Internal State"}
          </p>
          {useComplexStepping && (
            <p className="text-xs text-gray-500 mt-1">
              Steps: $1k (≤$100k) → $2k ($100k-$200k) → $5k ({">"}$200k)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomRangeSlider;
