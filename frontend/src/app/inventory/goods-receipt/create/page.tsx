'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { Package01Icon, Calendar01Icon, UserIcon, File01Icon, ArrowLeft01Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons';
import { goodsReceiptService } from '@/services/inventory';

interface GoodsReceiptFormData {
  purchase_order_id: string;
  warehouse_id: string;
  receipt_date: string;
  notes?: string;
  received_by?: string;
}

interface PurchaseOrder {
  id: string;
  supplier_name: string;
  order_date: string;
  total_amount: number;
  status: string;
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
}

export default function CreateGoodsReceiptPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GoodsReceiptFormData>({
    purchase_order_id: '',
    warehouse_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    notes: '',
    received_by: ''
  });

  // Mock data for dropdowns - in real app these would be fetched from API
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-001',
      supplier_name: 'PT Sepatu Nusantara',
      order_date: '2024-01-15',
      total_amount: 4500000,
      status: 'approved'
    },
    {
      id: 'po-002',
      supplier_name: 'CV Kulit Berkualitas',
      order_date: '2024-01-16',
      total_amount: 3200000,
      status: 'approved'
    },
    {
      id: 'po-003',
      supplier_name: 'UD Bahan Jaya',
      order_date: '2024-01-17',
      total_amount: 5800000,
      status: 'approved'
    }
  ]);

  const [warehouses] = useState<Warehouse[]>([
    {
      id: 'wh-001',
      name: 'Jakarta Central Warehouse',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat'
    },
    {
      id: 'wh-002',
      name: 'Surabaya Distribution Center',
      address: 'Jl. Pahlawan No. 456, Surabaya'
    },
    {
      id: 'wh-003',
      name: 'Bandung Storage Facility',
      address: 'Jl. Asia Afrika No. 789, Bandung'
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof GoodsReceiptFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purchase_order_id || !formData.warehouse_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        purchase_order_id: formData.purchase_order_id,
        warehouse_id: formData.warehouse_id
      };

      console.log('Creating goods receipt with data:', submitData);
      await goodsReceiptService.create(submitData);
      
      alert('Goods receipt created successfully!');
      router.push('/inventory/goods-receipt');
    } catch (error) {
      console.error('Error creating goods receipt:', error);
      alert('Failed to create goods receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory/goods-receipt');
  };

  const selectedPO = purchaseOrders.find(po => po.id === formData.purchase_order_id);
  const selectedWarehouse = warehouses.find(wh => wh.id === formData.warehouse_id);

  return (
    <TwoLevelLayout>
      <Header 
        title="Create Goods Receipt"
        description="Record a new goods receipt from supplier delivery"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Receipt", href: "/inventory/goods-receipt" },
          { label: "Create" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Package01Icon} className="w-5 h-5" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="purchase_order_id">
                    Purchase Order <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.purchase_order_id} 
                    onValueChange={(value) => handleInputChange('purchase_order_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purchase order" />
                    </SelectTrigger>
                    <SelectContent>
                      {mounted && purchaseOrders.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.supplier_name} - {mounted ? new Date(po.order_date).toLocaleDateString('id-ID') : ''} 
                          ({mounted ? `Rp ${po.total_amount.toLocaleString('id-ID')}` : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPO && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Supplier: {selectedPO.supplier_name} • Status: {selectedPO.status}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse_id">
                    Warehouse <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.warehouse_id} 
                    onValueChange={(value) => handleInputChange('warehouse_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {mounted && warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWarehouse && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedWarehouse.address}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_date" className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
                    Receipt Date
                  </Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="received_by" className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
                    Received By
                  </Label>
                  <Input
                    id="received_by"
                    type="text"
                    placeholder="Enter receiver name"
                    value={formData.received_by}
                    onChange={(e) => handleInputChange('received_by', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <HugeiconsIcon icon={File01Icon} className="w-4 h-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes or comments..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {(formData.purchase_order_id || formData.warehouse_id) && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedPO && (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Purchase Order Details</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Supplier: {selectedPO.supplier_name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Order Date: {mounted ? new Date(selectedPO.order_date).toLocaleDateString('id-ID') : ''}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Amount: {mounted ? `Rp ${selectedPO.total_amount.toLocaleString('id-ID')}` : ''}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Status: <span className="capitalize">{selectedPO.status}</span>
                      </div>
                    </div>
                  )}
                  {selectedWarehouse && (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Warehouse Details</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Name: {selectedWarehouse.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Address: {selectedWarehouse.address}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.purchase_order_id || !formData.warehouse_id}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4 mr-2" />
              )}
              Create Receipt
            </Button>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  );
}