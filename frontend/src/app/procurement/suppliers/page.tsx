
import { cookies } from 'next/headers'
import { supplierService } from '@/services/masterdata'
import { Supplier } from '@/types/masterdata'
import SuppliersList from './SuppliersList'

export default async function ProcurementSuppliersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  let initialData: Supplier[] = []

  if (token) {
    try {
      const response = await supplierService.getAll({}, token)
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        initialData = response.data
      } else if (response.data && 'data' in response.data) {
        initialData = response.data.data
      }
    } catch (error) {
      console.error('SSR Fetch Error:', error)
    }
  }

  return <SuppliersList initialData={initialData} />
}