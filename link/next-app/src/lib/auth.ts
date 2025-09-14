import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "demo",
      credentials: {
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        console.log("🔐 Auth attempt with credentials:", credentials)

        if (!credentials?.email) {
          console.log("❌ No email provided")
          return null
        }

        try {
          console.log("🔍 Looking for user with email:", credentials.email)

          // Pour la démo, on crée ou trouve l'utilisateur
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log("📝 Creating new user:", credentials.email)
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0]
              }
            })
            console.log("✅ User created:", user)
          } else {
            console.log("👤 User found:", user)
          }

          console.log("🎯 Returning user object:", {
            id: user.id,
            email: user.email,
            name: user.name
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("💥 Auth error:", error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      console.log("🎫 Session callback - session:", session, "token:", token)
      if (session?.user && token.uid) {
        (session.user as any).id = token.uid
      }
      console.log("🎫 Session callback - returning:", session)
      return session
    },
    jwt: async ({ user, token }) => {
      console.log("🔑 JWT callback - user:", user, "token:", token)
      if (user) {
        token.uid = user.id
      }
      console.log("🔑 JWT callback - returning:", token)
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // Pour voir les logs
}