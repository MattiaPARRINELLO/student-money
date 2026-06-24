import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || "student-money-secret-key-change-in-prod"
)
const COOKIE_NAME = "admin_session"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (!pathname.startsWith("/admin")) return NextResponse.next()

  if (pathname === "/admin/login") {
    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  }

  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, SECRET)
    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  } catch {
    const loginUrl = new URL("/admin/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = { matcher: "/admin/:path*" }
