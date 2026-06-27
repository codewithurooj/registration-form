import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const auth = request.headers.get("authorization")

  if (auth) {
    const [type, credentials] = auth.split(" ")
    if (type === "Basic") {
      const decoded = atob(credentials)
      const password = decoded.split(":").slice(1).join(":")
      if (password === process.env.ADMIN_PASSWORD) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse(null, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  })
}

export const config = {
  matcher: "/admin/:path*",
}
