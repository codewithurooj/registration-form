import Link from "next/link"
import { redirect } from "next/navigation"

interface ThankYouPageProps {
  searchParams: { name?: string }
}

export default function ThankYouPage({ searchParams }: ThankYouPageProps) {
  if (!searchParams.name) redirect("/")

  const firstName = decodeURIComponent(searchParams.name).split(" ")[0]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Thank You, {firstName}!</h1>
        <p className="text-gray-600 mt-2">
          Your registration has been received. We&apos;ll be in touch shortly.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
