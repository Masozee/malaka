
import { cookies } from 'next/headers'
import { rfqService, RFQ } from '@/services/rfq'
import RFQList from './RFQList'

export default async function RFQPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('malaka_auth_token')?.value

  let initialData: RFQ[] = []

  if (token) {
    try {
      const response = await rfqService.getAllRFQs({ limit: 100 }, token)
      initialData = response.rfqs || []
    } catch (error) {
      console.error('SSR Fetch Error:', error)
    }
  }

  return <RFQList initialData={initialData} />
}