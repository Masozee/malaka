
import { cookies } from 'next/headers'
import { vendorEvaluationService } from '@/services/procurement'
import { VendorEvaluation } from '@/types/procurement'
import VendorEvaluationList from './VendorEvaluationList'

export default async function VendorEvaluationPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  let initialData: VendorEvaluation[] = []

  if (token) {
    try {
      const response = await vendorEvaluationService.getAll({}, token)
      initialData = response.data || []
    } catch (error) {
      console.error('SSR Fetch Error:', error)
    }
  }

  return <VendorEvaluationList initialData={initialData} />
}
