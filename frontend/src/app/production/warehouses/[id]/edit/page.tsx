'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { ProductionService } from '@/services/production'
import type { Warehouse } from '@/types/production'

export default function EditWarehousePage() {
  const router = useRouter()
  const params = useParams()
  const warehouseId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'main' as 'main' | 'satellite' | 'transit' | 'quarantine' | 'distribution' | 'retail',
    address: '',
    city: '',
    capacity: '',
    current_stock: '',
    manager: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance' | 'planned'
  })

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Warehouses', href: '/production/warehouses' },
    { label: 'Edit Warehouse', href: `/production/warehouses/${warehouseId}/edit` }
  ]

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setFetchLoading(true)
        const data = await ProductionService.getWarehouseById(warehouseId)
        setWarehouse(data)
        
        // Populate form with existing data
        setFormData({
          code: data.code || '',
          name: data.name || '',
          type: data.type || 'main',
          address: data.address || '',
          city: data.city || '',
          capacity: data.capacity?.toString() || '',
          current_stock: data.current_stock?.toString() || '',
          manager: data.manager || '',
          phone: data.phone || '',
          email: data.email || '',
          status: data.status || 'active'
        })
      } catch (error) {
        console.error('Error fetching warehouse:', error)
        alert('Failed to load warehouse data')
        router.push('/production/warehouses')
      } finally {
        setFetchLoading(false)
      }
    }

    if (warehouseId) {
      fetchWarehouse()
    }
  }, [warehouseId, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const warehouseData = {
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
        current_stock: parseInt(formData.current_stock) || 0
      }

      await ProductionService.updateWarehouse(warehouseId, warehouseData)
      router.push('/production/warehouses')
    } catch (error) {
      console.error('Error updating warehouse:', error)
      alert('Failed to update warehouse. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Warehouse"
          description="Loading warehouse data..."
          breadcrumbs={breadcrumbs}
        />
        
        <div className="flex-1 p-6">
          <Card className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center p-12">
              <CircleNotch className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading warehouse data...</span>
            </div>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title="Edit Warehouse"
        description={`Edit warehouse: ${warehouse?.name || 'Unknown'}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />
      
      <div className="flex-1 p-6">
        <Card className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Warehouse Code*</Label>
                  <Input
                    id="code"
                    placeholder="e.g., WH-JKT-001"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name*</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Warehouse Jakarta"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type*</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Warehouse</SelectItem>
                      <SelectItem value="satellite">Satellite Warehouse</SelectItem>
                      <SelectItem value="transit">Transit Warehouse</SelectItem>
                      <SelectItem value="quarantine">Quarantine Warehouse</SelectItem>
                      <SelectItem value="distribution">Distribution Center</SelectItem>
                      <SelectItem value="retail">Retail Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status*</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location & Contact</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Jakarta"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address*</Label>
                  <Textarea
                    id="address"
                    placeholder="Full warehouse address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    placeholder="Warehouse manager name"
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Contact phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Warehouse email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Capacity Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold">Capacity Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Total Capacity*</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Maximum storage capacity"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      placeholder="Current stock level"
                      value={formData.current_stock}
                      onChange={(e) => handleInputChange('current_stock', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <FloppyDisk className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Warehouse'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}