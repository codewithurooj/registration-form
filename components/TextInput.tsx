import { forwardRef, InputHTMLAttributes } from "react"

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ error, className, ...props }, ref) => {
  const base = "w-full px-3 py-2 rounded-md border text-gray-900 text-sm transition-colors focus:outline-none"
  const normal = "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  const errorStyle = "border-red-500 bg-white focus:ring-2 focus:ring-red-200"

  return <input ref={ref} className={`${base} ${error ? errorStyle : normal} ${className ?? ""}`} {...props} />
})

TextInput.displayName = "TextInput"
export default TextInput
