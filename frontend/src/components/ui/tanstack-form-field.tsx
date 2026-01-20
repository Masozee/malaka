"use client"

import * as React from "react"
import { useFieldContext } from "@tanstack/react-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * TanStack Form Field Components
 *
 * These components integrate with TanStack Form's field context
 * for automatic state management and validation.
 */

interface BaseFieldProps {
  label: string
  required?: boolean
  disabled?: boolean
  className?: string
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel" | "password" | "url" | "date" | "number"
  placeholder?: string
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  rows?: number
}

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[]
  placeholder?: string
}

interface ColorFieldProps extends BaseFieldProps {}

/**
 * TanStack Form Text Field
 */
export function FormTextField({
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const errorMessage = field.state.meta.errors[0]

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label
        htmlFor={field.name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={hasError ? "border-red-500 focus:border-red-500" : ""}
      />
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}

/**
 * TanStack Form Textarea Field
 */
export function FormTextareaField({
  label,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  className,
}: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const errorMessage = field.state.meta.errors[0]

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label
        htmlFor={field.name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={hasError ? "border-red-500 focus:border-red-500" : ""}
      />
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}

/**
 * TanStack Form Select Field
 */
export function FormSelectField({
  label,
  options,
  placeholder = "Select an option...",
  required = false,
  disabled = false,
  className,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const errorMessage = field.state.meta.errors[0]

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label
        htmlFor={field.name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={field.state.value || ""}
        onValueChange={(value) => field.handleChange(value)}
        disabled={disabled}
      >
        <SelectTrigger
          className={hasError ? "border-red-500 focus:border-red-500" : ""}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}

/**
 * TanStack Form Color Field
 */
export function FormColorField({
  label,
  required = false,
  disabled = false,
  className,
}: ColorFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const errorMessage = field.state.meta.errors[0]

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label
        htmlFor={field.name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex space-x-2">
        <Input
          id={field.name}
          name={field.name}
          type="text"
          value={field.state.value || ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          placeholder="#000000"
          disabled={disabled}
          className={`flex-1 ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
        />
        <div className="relative">
          <input
            type="color"
            value={field.state.value || "#000000"}
            onChange={(e) => field.handleChange(e.target.value)}
            disabled={disabled}
            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}
