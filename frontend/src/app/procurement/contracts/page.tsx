
import { cookies } from 'next/headers'
import { contractService } from '@/services/procurement'
import { Contract } from '@/types/procurement'
import ContractsList from './ContractsList'

export default async function ContractsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  let initialData: Contract[] = []

  if (token) {
    try {
      const response = await contractService.getAll({ page: 1, limit: 20 }, token)
      initialData = response.data || []
    } catch (error) {
      console.error('SSR Fetch Error:', error)
    }
  }

  return <ContractsList initialData={initialData} />
}
