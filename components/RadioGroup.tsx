interface Option {
  label: string
  value: string
}

interface RadioGroupProps {
  name: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-6 gap-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            id={`${name}-${opt.value}`}
            className="accent-blue-600 w-4 h-4"
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
