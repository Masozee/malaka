"use client";

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  return (
    <div className={clsx(fullWidth && "w-full")}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={clsx(
          // Base styles
          "block border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          
          // Error state
          error && "border-red-300 focus:ring-red-500 focus:border-red-500",
          
          // Full width
          fullWidth ? "w-full" : "min-w-0",
          
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;