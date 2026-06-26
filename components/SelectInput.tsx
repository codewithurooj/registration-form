import { forwardRef, SelectHTMLAttributes } from "react"

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  placeholder?: string
  options: string[]
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ error, placeholder, options, className, ...props }, ref) => {
    const base = "w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none appearance-none bg-no-repeat"
    const normal = "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    const errorStyle = "border-red-500 bg-white text-gray-900 focus:ring-2 focus:ring-red-200"
    const disabledStyle = "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"

    const style = props.disabled ? disabledStyle : error ? errorStyle : normal

    return (
      <select ref={ref} className={`${base} ${style} ${className ?? ""}`} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }
)

SelectInput.displayName = "SelectInput"
export default SelectInput
