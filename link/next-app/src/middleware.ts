import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic ici si nécessaire
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Pour les routes dashboard, on a besoin d'être connecté
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        // Les autres routes sont publiques
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*"
  ]
}