interface CheckboxGroupProps {
  name: string
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export default function CheckboxGroup({ name, options, value, onChange }: CheckboxGroupProps) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            id={`${name}-${opt.toLowerCase()}`}
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
            className="accent-blue-600 w-4 h-4"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}
