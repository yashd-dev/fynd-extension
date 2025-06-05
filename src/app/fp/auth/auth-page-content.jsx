"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const client_id = searchParams.get("client_id")
    const company_id = searchParams.get("company_id")

    if (code && state && client_id && company_id) {
      const exchangeToken = async () => {
        try {
          const res = await fetch("/api/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, client_id, company_id }),
          })

          const data = await res.json()
          console.log("Token response:", data)

          if (res.ok) {
            localStorage.setItem("fynd_access_token", data.access_token)
            localStorage.setItem("fynd_company_id", company_id)
            router.push("/")
          } else {
            console.error("Token exchange failed:", data)
          }
        } catch (error) {
          console.error("Error during token exchange:", error)
        }
      }

      exchangeToken()
    }
  }, [searchParams, router])

  return <p>Authorizing with Fynd...</p>
}
