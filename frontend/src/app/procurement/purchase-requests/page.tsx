
import { cookies } from 'next/headers'
import { purchaseRequestService } from '@/services/procurement'
import { PurchaseRequest } from '@/types/procurement'
import PurchaseRequestsList from './PurchaseRequestsList'

export default async function PurchaseRequestsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  let initialData: PurchaseRequest[] = []

  if (token) {
    try {
      const response = await purchaseRequestService.getAll({ page: 1, limit: 20 }, token)
      initialData = response.data || []
    } catch (error) {
      console.error('SSR Fetch Error:', error)
    }
  }

  return <PurchaseRequestsList initialData={initialData} />
}
