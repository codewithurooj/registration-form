interface SubmitButtonProps {
  isSubmitting: boolean
}

export default function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`flex items-center justify-center gap-2 px-8 py-3 rounded-md text-white text-sm font-medium transition-colors w-full sm:w-auto sm:ml-auto
        ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {isSubmitting && (
        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {isSubmitting ? "Submitting…" : "Submit Registration"}
    </button>
  )
}
