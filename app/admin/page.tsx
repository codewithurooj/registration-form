import Image from "next/image"
import Link from "next/link"
import { getAllRegistrations } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const registrations = await getAllRegistrations()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
            <p className="text-sm text-gray-500 mt-1">
              {registrations.length} {registrations.length === 1 ? "submission" : "submissions"} total
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Registration Form
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No registrations yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Photo</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Full Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Mobile</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Date of Birth</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Gender</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Interests</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Country</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">City</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((r, index) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Image
                          src={r.photoUrl}
                          alt={r.fullName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.mobile}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.dateOfBirth}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.gender}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.interests.map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.country}</td>
                      <td className="px-4 py-3 text-gray-600">{r.city}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
