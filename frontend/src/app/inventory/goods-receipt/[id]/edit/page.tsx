'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
;
import { goodsReceiptService, GoodsReceipt } from '@/services/inventory';

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

export default function EditGoodsReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoodsReceiptFormData>({
    purchase_order_id: '',
    warehouse_id: '',
    receipt_date: '',
    notes: '',
    received_by: ''
  });

  const receiptId = params.id as string;

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

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      setError(null);
      const receiptData = await goodsReceiptService.getById(receiptId);
      console.log('Fetched receipt for editing:', receiptData);
      
      setReceipt(receiptData);
      
      // Populate form with existing data
      setFormData({
        purchase_order_id: receiptData.purchase_order_id || '',
        warehouse_id: receiptData.warehouse_id || '',
        receipt_date: receiptData.receipt_date ? receiptData.receipt_date.split('T')[0] : '',
        notes: receiptData.notes || '',
        received_by: receiptData.receivedBy || ''
      });
      
    } catch (error) {
      console.error('Error fetching goods receipt for editing:', error);
      setError('Failed to load goods receipt data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receiptId) {
      fetchReceiptData();
    }
  }, [receiptId]);

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
      setSaving(true);
      
      const updateData = {
        purchase_order_id: formData.purchase_order_id,
        warehouse_id: formData.warehouse_id
      };

      console.log('Updating goods receipt with data:', updateData);
      await goodsReceiptService.update(receiptId, updateData);
      
      alert('Goods receipt updated successfully!');
      router.push(`/inventory/goods-receipt/${receiptId}`);
    } catch (error) {
      console.error('Error updating goods receipt:', error);
      alert('Failed to update goods receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/inventory/goods-receipt/${receiptId}`);
  };

  const selectedPO = purchaseOrders.find(po => po.id === formData.purchase_order_id);
  const selectedWarehouse = warehouses.find(wh => wh.id === formData.warehouse_id);

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Edit Goods Receipt"
          description="Loading receipt information..."
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Goods Receipt", href: "/inventory/goods-receipt" },
            { label: "Edit" }
          ]}
        />
        
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading goods receipt data...</p>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    );
  }

  if (error || !receipt) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Edit Goods Receipt"
          description="Error loading receipt information"
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Goods Receipt", href: "/inventory/goods-receipt" },
            { label: "Edit" }
          ]}
        />
        
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <WarningCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {error || 'Goods Receipt Not Found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The goods receipt you're trying to edit could not be found or loaded.
              </p>
              <Button onClick={() => router.push('/inventory/goods-receipt')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Goods Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    );
  }

  return (
    <TwoLevelLayout>
      <Header 
        title={`Edit Goods Receipt ${receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`}`}
        description="Modify goods receipt information"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Receipt", href: "/inventory/goods-receipt" },
          { label: receipt.receiptNumber || "Receipt" },
          { label: "Edit" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
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
                    <Calendar className="w-4 h-4" />
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
                    <User className="w-4 h-4" />
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
                    <FileText className="w-4 h-4" />
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

          {/* Current Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Receipt Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Receipt ID</div>
                  <div className="text-gray-600 dark:text-gray-400">{receipt.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Status</div>
                  <div className="text-gray-600 dark:text-gray-400 capitalize">{receipt.status || 'pending'}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Created Date</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {mounted && receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('id-ID') : ''}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Last Updated</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {mounted && receipt.updated_at ? new Date(receipt.updated_at).toLocaleDateString('id-ID') : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={saving}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || !formData.purchase_order_id || !formData.warehouse_id}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FloppyDisk className="w-4 h-4 mr-2" />
              )}
              Update Receipt
            </Button>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  );
}