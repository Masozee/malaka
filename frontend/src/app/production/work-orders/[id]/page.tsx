'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import Link from 'next/link'
import { mockWorkOrders } from '@/services/production'
import type { WorkOrder, WorkOrderOperation, WorkOrderMaterial } from '@/types/production'
import { useParams } from 'next/navigation'

export default function WorkOrderDetailsPage() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const workOrderId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the work order (in real app, this would be an API call)
  const workOrder = mockWorkOrders.find(wo => wo.id === workOrderId)

  if (!workOrder) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Work Order Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested work order could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/production/work-orders">Back to Work Orders</Link>
            </Button>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Work Orders', href: '/production/work-orders' },
    { label: workOrder.workOrderNumber, href: `/production/work-orders/${workOrder.id}` }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getStatusBadge = (status: WorkOrder['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      scheduled: { variant: 'default' as const, label: 'Scheduled' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      paused: { variant: 'outline' as const, label: 'Paused' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, label: 'Low' },
      normal: { variant: 'outline' as const, label: 'Normal' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return priorityConfig[priority] || { variant: 'secondary' as const, label: priority }
  }

  const getOperationStatusBadge = (status: WorkOrderOperation['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      completed: { variant: 'default' as const, label: 'Completed' },
      skipped: { variant: 'outline' as const, label: 'Skipped' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  // Calculate progress metrics
  const completedOperations = workOrder.operations.filter(op => op.status === 'completed').length
  const totalOperations = workOrder.operations.length
  const operationProgress = totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0
  
  // Status colors for cards
  const getStatusColor = (status: WorkOrder['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.draft
  }

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    }
    return colors[priority] || colors.normal
  }

  return (
    <TwoLevelLayout>
      <Header 
        title={workOrder.workOrderNumber}
        description={`${workOrder.type.charAt(0).toUpperCase() + workOrder.type.slice(1)} work order for ${workOrder.productName}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/production/work-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Print
            </Button>
            {workOrder.status === 'scheduled' && (
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            {workOrder.status === 'in_progress' && (
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {workOrder.status === 'in_progress' && (
              <Button variant="outline" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href={`/production/work-orders/${workOrder.id}/edit`}>
                <PencilSimple className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getStatusColor(workOrder.status)}`}>
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{getStatusBadge(workOrder.status).label}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getPriorityColor(workOrder.priority)}`}>
                <Warning className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <p className="text-lg font-semibold">{getPriorityBadge(workOrder.priority).label}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <TrendUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-lg font-semibold">{workOrder.efficiency}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 text-green-700">
                <CurrencyDollar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Usage</p>
                <p className="text-lg font-semibold">
                  {workOrder.totalCost > 0 ? Math.round((workOrder.actualCost / workOrder.totalCost) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Tabs temporarily disabled */}
        {/* <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6"> */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Work Order Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Work Order Number</label>
                    <p className="font-medium">{workOrder.workOrderNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="font-medium capitalize">{workOrder.type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product</label>
                    <p className="font-medium">{workOrder.productName}</p>
                    <p className="text-sm text-muted-foreground">{workOrder.productCode}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                    <p className="font-medium">{workOrder.quantity} units</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(workOrder.status)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <Badge {...getPriorityBadge(workOrder.priority)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
                    <p className="font-medium">{workOrder.warehouse.name}</p>
                    <p className="text-sm text-muted-foreground">{workOrder.warehouse.code}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Supervisor</label>
                    <p className="font-medium">{workOrder.supervisor}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Schedule Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule & Progress</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Planned Start Date</label>
                    <p className="font-medium">{formatDate(workOrder.plannedStartDate)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Planned End Date</label>
                    <p className="font-medium">{formatDate(workOrder.plannedEndDate)}</p>
                  </div>
                  
                  {workOrder.actualStartDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Actual Start Date</label>
                      <p className="font-medium">{formatDate(workOrder.actualStartDate)}</p>
                    </div>
                  )}
                  
                  {workOrder.actualEndDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Actual End Date</label>
                      <p className="font-medium">{formatDate(workOrder.actualEndDate)}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Efficiency</label>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{workOrder.efficiency}%</span>
                        <span className="text-muted-foreground">Target: 85%</span>
                      </div>
                      <Progress value={workOrder.efficiency} className="h-3" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Quality Score</label>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{workOrder.qualityScore || 'N/A'}</span>
                        <span className="text-muted-foreground">Target: 95%</span>
                      </div>
                      {workOrder.qualityScore > 0 && (
                        <Progress value={workOrder.qualityScore} className="h-3" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Materials */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Materials</h3>
              
              <div className="space-y-4">
                {workOrder.materials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{material.articleName}</h4>
                        <p className="text-sm text-muted-foreground">{material.articleCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(material.totalCost)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(material.unitCost)} per unit
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Required</label>
                        <p className="font-medium">{material.requiredQuantity}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Allocated</label>
                        <p className="font-medium">{material.allocatedQuantity}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Consumed</label>
                        <p className="font-medium">{material.consumedQuantity}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Waste</label>
                        <p className="font-medium text-red-600">{material.wasteQuantity}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round((material.consumedQuantity / material.requiredQuantity) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(material.consumedQuantity / material.requiredQuantity) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Operations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Operations</h3>
              
              <div className="space-y-4">
                {workOrder.operations.map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {operation.operationNumber}
                        </div>
                        <div>
                          <h4 className="font-medium">{operation.name}</h4>
                          <p className="text-sm text-muted-foreground">{operation.description}</p>
                        </div>
                      </div>
                      <Badge {...getOperationStatusBadge(operation.status)} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <label className="text-muted-foreground">Assigned To</label>
                        <p className="font-medium">{operation.assignedTo}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Machine</label>
                        <p className="font-medium">{operation.machineId || 'Manual'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Planned Duration</label>
                        <p className="font-medium">{operation.plannedDuration}h</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Actual Duration</label>
                        <p className="font-medium">{operation.actualDuration}h</p>
                      </div>
                    </div>
                    
                    {operation.startTime && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <label className="text-muted-foreground">Start Time</label>
                          <p className="font-medium">{formatDateTime(operation.startTime)}</p>
                        </div>
                        {operation.endTime && (
                          <div>
                            <label className="text-muted-foreground">End Time</label>
                            <p className="font-medium">{formatDateTime(operation.endTime)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {operation.notes && (
                      <div className="mt-3">
                        <label className="text-muted-foreground text-sm">Notes</label>
                        <p className="text-sm">{operation.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Planned Cost</span>
                  <span className="font-medium">{formatCurrency(workOrder.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Cost</span>
                  <span className="font-medium">{formatCurrency(workOrder.actualCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Variance</span>
                  <span className={`font-medium ${workOrder.actualCost > workOrder.totalCost ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(workOrder.actualCost - workOrder.totalCost)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Usage</span>
                  <span>{Math.round((workOrder.actualCost / workOrder.totalCost) * 100)}%</span>
                </div>
                <Progress 
                  value={(workOrder.actualCost / workOrder.totalCost) * 100} 
                  className="h-2" 
                />
              </div>
            </Card>

            {/* Assigned Team */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assigned Team</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supervisor</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{workOrder.supervisor}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Team Members</label>
                  <div className="space-y-2 mt-2">
                    {workOrder.assignedTo.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                          {member.slice(-2)}
                        </div>
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Work Order Audit */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created By</label>
                  <p className="font-medium">{workOrder.createdBy}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDateTime(workOrder.createdAt)}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateTime(workOrder.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {workOrder.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-sm">{workOrder.notes}</p>
              </Card>
            )}
          </div>
        </div>
        </div>
        {/* </TabsContent>
        </Tabs> */}
      </div>
    </TwoLevelLayout>
  )
}