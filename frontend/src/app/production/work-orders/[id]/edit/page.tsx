'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'

import Link from 'next/link'
import { mockWorkOrders, mockWarehouses } from '@/services/production'
import type { WorkOrder } from '@/types/production'

interface MaterialItem {
  id: string
  articleId: string
  articleCode: string
  articleName: string
  requiredQuantity: number
  allocatedQuantity: number
  consumedQuantity: number
  unitCost: number
  totalCost: number
  wasteQuantity: number
}

interface OperationItem {
  id: string
  operationNumber: number
  name: string
  description: string
  plannedDuration: number
  actualDuration: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignedTo: string
  machineId?: string
  startTime?: string
  endTime?: string
  notes?: string
}

// Mock data (same as create form)
const mockProducts = [
  { id: 'PROD001', code: 'SHOE-001', name: 'Classic Oxford Brown' },
  { id: 'PROD002', code: 'SHOE-002', name: 'Sports Sneaker White' },
  { id: 'PROD003', code: 'BOOT-001', name: 'Work Boot Black' },
  { id: 'PROD004', code: 'SANDAL-001', name: 'Summer Sandal Brown' },
  { id: 'PROD005', code: 'SHOE-003', name: 'Formal Loafer Black' }
]

const mockEmployees = [
  'EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005',
  'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010'
]

const mockMaterials = [
  { id: 'ART001', code: 'LEATHER-001', name: 'Premium Leather Brown', unitCost: 150000 },
  { id: 'ART002', code: 'SOLE-001', name: 'Rubber Sole Premium', unitCost: 85000 },
  { id: 'ART003', code: 'FABRIC-001', name: 'Canvas Fabric White', unitCost: 45000 },
  { id: 'ART004', code: 'LACES-001', name: 'Polyester Laces', unitCost: 5000 },
  { id: 'ART005', code: 'THREAD-001', name: 'Polyester Thread', unitCost: 8000 }
]

export default function EditWorkOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)

  const [formData, setFormData] = useState({
    workOrderNumber: '',
    type: 'production' as 'production' | 'assembly' | 'packaging' | 'repair' | 'maintenance',
    productId: '',
    productCode: '',
    productName: '',
    quantity: 1,
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    status: 'draft' as 'draft' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    warehouseId: '',
    assignedTo: [] as string[],
    supervisor: '',
    materials: [] as MaterialItem[],
    operations: [] as OperationItem[],
    efficiency: 0,
    qualityScore: 0,
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
    const id = params.id as string
    const order = mockWorkOrders.find(wo => wo.id === id)
    
    if (order) {
      setWorkOrder(order)
      setFormData({
        workOrderNumber: order.workOrderNumber,
        type: order.type,
        productId: order.productId,
        productCode: order.productCode,
        productName: order.productName,
        quantity: order.quantity,
        plannedStartDate: order.plannedStartDate,
        plannedEndDate: order.plannedEndDate,
        actualStartDate: order.actualStartDate || '',
        actualEndDate: order.actualEndDate || '',
        status: order.status,
        priority: order.priority,
        warehouseId: order.warehouseId,
        assignedTo: order.assignedTo,
        supervisor: order.supervisor,
        materials: order.materials.map(m => ({
          id: m.id,
          articleId: m.articleId,
          articleCode: m.articleCode,
          articleName: m.articleName,
          requiredQuantity: m.requiredQuantity,
          allocatedQuantity: m.allocatedQuantity,
          consumedQuantity: m.consumedQuantity,
          unitCost: m.unitCost,
          totalCost: m.totalCost,
          wasteQuantity: m.wasteQuantity
        })),
        operations: order.operations.map(o => ({
          id: o.id,
          operationNumber: o.operationNumber,
          name: o.name,
          description: o.description,
          plannedDuration: o.plannedDuration,
          actualDuration: o.actualDuration,
          status: o.status,
          assignedTo: o.assignedTo,
          machineId: o.machineId,
          startTime: o.startTime,
          endTime: o.endTime,
          notes: o.notes
        })),
        efficiency: order.efficiency,
        qualityScore: order.qualityScore,
        notes: order.notes || ''
      })
    }
  }, [params.id])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Work Orders', href: '/production/work-orders' },
    { label: workOrder?.workOrderNumber || 'Loading...', href: `/production/work-orders/${params.id}` },
    { label: 'Edit', href: `/production/work-orders/${params.id}/edit` }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const handleProductChange = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        productCode: product.code,
        productName: product.name
      }))
    }
  }

  const addMaterial = () => {
    const newId = `MAT-${Date.now()}`
    const newMaterial: MaterialItem = {
      id: newId,
      articleId: '',
      articleCode: '',
      articleName: '',
      requiredQuantity: 1,
      allocatedQuantity: 0,
      consumedQuantity: 0,
      unitCost: 0,
      totalCost: 0,
      wasteQuantity: 0
    }
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }))
  }

  const removeMaterial = (id: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id)
    }))
  }

  const updateMaterial = (id: string, field: keyof MaterialItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(m => {
        if (m.id === id) {
          const updated = { ...m, [field]: value }
          
          if (field === 'articleId') {
            const article = mockMaterials.find(a => a.id === value)
            if (article) {
              updated.articleCode = article.code
              updated.articleName = article.name
              updated.unitCost = article.unitCost
            }
          }
          
          if (field === 'requiredQuantity' || field === 'unitCost') {
            updated.totalCost = updated.requiredQuantity * updated.unitCost
          }
          
          return updated
        }
        return m
      })
    }))
  }

  const addOperation = () => {
    const newId = `OP-${Date.now()}`
    const newOperation: OperationItem = {
      id: newId,
      operationNumber: formData.operations.length + 1,
      name: '',
      description: '',
      plannedDuration: 1,
      actualDuration: 0,
      status: 'pending',
      assignedTo: '',
      machineId: ''
    }
    setFormData(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation]
    }))
  }

  const removeOperation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.filter(o => o.id !== id).map((op, index) => ({
        ...op,
        operationNumber: index + 1
      }))
    }))
  }

  const updateOperation = (id: string, field: keyof OperationItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.map(o => 
        o.id === id ? { ...o, [field]: value } : o
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Here you would normally make an API call
      console.log('Updating work order:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to detail page
      router.push(`/production/work-orders/${params.id}`)
    } catch (error) {
      console.error('Error updating work order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalMaterialCost = formData.materials.reduce((sum, m) => sum + m.totalCost, 0)

  if (!mounted) {
    return <div>Loading...</div>
  }

  if (!workOrder) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Work Order Not Found"
          description="The requested work order could not be found"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <Card className="p-8 text-center">
            <Warning className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Work Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The work order you're trying to edit doesn't exist or may have been deleted.
            </p>
            <Button asChild>
              <Link href="/production/work-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Work Orders
              </Link>
            </Button>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header 
        title={`Edit ${workOrder.workOrderNumber}`}
        description={`Edit ${workOrder.type} work order for ${workOrder.productName}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/production/work-orders/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button 
              size="sm" 
              form="work-order-form"
              type="submit"
              disabled={isSubmitting}
            >
              <FloppyDisk className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <form id="work-order-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Factory className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="workOrderNumber">Work Order Number</Label>
                <Input
                  id="workOrderNumber"
                  value={formData.workOrderNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, workOrderNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="assembly">Assembly</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select 
                  value={formData.warehouseId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency (%)</Label>
                <Input
                  id="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.efficiency}
                  onChange={(e) => setFormData(prev => ({ ...prev, efficiency: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityScore">Quality Score (%)</Label>
                <Input
                  id="qualityScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityScore: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plannedStartDate">Planned Start Date</Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, plannedStartDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedEndDate">Planned End Date</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={formData.plannedEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, plannedEndDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={formData.actualStartDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualStartDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Actual End Date</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  value={formData.actualEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualEndDate: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Team Assignment */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Team Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select 
                  value={formData.supervisor} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((emp) => (
                      <SelectItem key={emp} value={emp}>
                        {emp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="flex flex-wrap gap-2">
                  {mockEmployees.slice(0, 8).map((emp) => (
                    <label key={emp} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(emp)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, assignedTo: [...prev.assignedTo, emp] }))
                          } else {
                            setFormData(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(id => id !== emp) }))
                          }
                        }}
                      />
                      <span className="text-sm">{emp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Materials */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Materials
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.materials.map((material, index) => (
                <div key={material.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Material {index + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMaterial(material.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Article</Label>
                      <Select 
                        value={material.articleId} 
                        onValueChange={(value) => updateMaterial(material.id, 'articleId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select article" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockMaterials.map((article) => (
                            <SelectItem key={article.id} value={article.id}>
                              {article.name} ({article.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Required Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={material.requiredQuantity}
                        onChange={(e) => updateMaterial(material.id, 'requiredQuantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Allocated Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.allocatedQuantity}
                        onChange={(e) => updateMaterial(material.id, 'allocatedQuantity', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Consumed Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.consumedQuantity}
                        onChange={(e) => updateMaterial(material.id, 'consumedQuantity', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Waste Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.wasteQuantity}
                        onChange={(e) => updateMaterial(material.id, 'wasteQuantity', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Cost</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.unitCost}
                        onChange={(e) => updateMaterial(material.id, 'unitCost', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="text-lg font-semibold">{formatCurrency(material.totalCost)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.materials.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No materials found. Click "Add Material" to add new ones.</p>
                </div>
              )}
            </div>

            {formData.materials.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Material Cost:</span>
                  <span className="text-lg font-semibold">{formatCurrency(totalMaterialCost)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Operations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Operations
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Operation
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.operations.map((operation, index) => (
                <div key={operation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Operation {operation.operationNumber}</span>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={operation.status} 
                        onValueChange={(value: any) => updateOperation(operation.id, 'status', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeOperation(operation.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Operation Name</Label>
                      <Input
                        value={operation.name}
                        onChange={(e) => updateOperation(operation.id, 'name', e.target.value)}
                        placeholder="e.g., Cutting, Stitching, Assembly"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Assigned To</Label>
                      <Select 
                        value={operation.assignedTo} 
                        onValueChange={(value) => updateOperation(operation.id, 'assignedTo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmployees.map((emp) => (
                            <SelectItem key={emp} value={emp}>
                              {emp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Planned Duration (hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={operation.plannedDuration}
                        onChange={(e) => updateOperation(operation.id, 'plannedDuration', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Actual Duration (hours)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={operation.actualDuration}
                        onChange={(e) => updateOperation(operation.id, 'actualDuration', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Machine ID (Optional)</Label>
                      <Input
                        value={operation.machineId || ''}
                        onChange={(e) => updateOperation(operation.id, 'machineId', e.target.value)}
                        placeholder="e.g., MACH001"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={operation.description}
                        onChange={(e) => updateOperation(operation.id, 'description', e.target.value)}
                        placeholder="Describe the operation details..."
                      />
                    </div>

                    {operation.notes && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Operation Notes</Label>
                        <Textarea
                          value={operation.notes || ''}
                          onChange={(e) => updateOperation(operation.id, 'notes', e.target.value)}
                          placeholder="Any additional notes for this operation..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {formData.operations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No operations found. Click "Add Operation" to add new ones.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or special instructions..."
              rows={4}
            />
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}