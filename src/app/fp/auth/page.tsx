import { Suspense } from "react"
import AuthPageContent from "./auth-page-content"

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Authorizing...</div>}>
            <AuthPageContent />
        </Suspense>
    )
}
