"use client"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const InstallPageContent = () => {
  const searchParams = useSearchParams()
  console.log("InstallPage searchParams:", searchParams.toString())
  console.log("InstallPage searchParams:", Object.fromEntries(searchParams.entries()))

  useEffect(() => {
    const company_id = searchParams.get("company_id")
    const cluster_url = searchParams.get("cluster_url")
    const client_id = process.env.NEXT_PUBLIC_NAISH_API_KEY

    if (typeof company_id === "string" && typeof cluster_url === "string" && typeof client_id === "string") {
      const redirect_uri = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/fp/auth` // Typically ends with /fp/auth
      const response_type = "code"
      const scope = "company/products/read,company/products/write,company/inventory/read,company/brands/read"
      const state = Math.random().toString(36).substring(2, 15)
      localStorage.setItem("oauth_state", state)
      const authorizeUrl = `${cluster_url}/service/panel/authentication/v1.0/company/${company_id}/oauth/authorize`

      const params = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type,
        scope,
        state,
      })

      const finalUrl = `${authorizeUrl}?${params.toString()}`

      console.log("Redirecting to:", finalUrl)

      window.location.href = finalUrl
    }
  }, [searchParams])

  return <p>Redirecting to Fynd OAuth...</p>
}

export default InstallPageContent;
