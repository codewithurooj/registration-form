interface ErrorBannerProps {
  message: string | null
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3" role="alert">
      <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  )
}
