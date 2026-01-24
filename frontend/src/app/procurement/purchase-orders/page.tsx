
import { cookies } from 'next/headers'
import { purchaseOrderService } from '@/services/procurement'
import { PurchaseOrder } from '@/types/procurement'
import PurchaseOrdersList from './PurchaseOrdersList'

export default async function PurchaseOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  // Default to empty list if no token 
  let initialData: PurchaseOrder[] = []

  if (token) {
    try {
      // Pass token to service for SSR fetch
      const response = await purchaseOrderService.getAll({ page: 1, limit: 10 }, token)
      initialData = response.data || []
    } catch (error) {
      console.error('SSR Fetch Error:', error)
      // Fallback to empty, client will try to fetch or show error
    }
  }

  return <PurchaseOrdersList initialData={initialData} />
}
