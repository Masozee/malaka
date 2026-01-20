"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GuidelinesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/guidelines/overview")
  }, [router])

  return null
}