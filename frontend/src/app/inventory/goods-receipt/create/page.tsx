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
import {
  PackageIcon,
  Calendar01Icon,
  File01Icon,
  ArrowLeft01Icon,
  FloppyDiskIcon
} from '@hugeicons/core-free-icons';
import { goodsReceiptService } from '@/services/inventory';
import { apiClient } from '@/lib/api';

interface GoodsReceiptFormData {
  purchase_order_id: string;
  warehouse_id: string;
  supplier_name: string;
  receipt_date: string;
  notes: string;
  po_number: string;
}

interface ProcurementPO {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  total_amount: number;
  currency: string;
  status: string;
  order_date: string;
  payment_terms: string;
  items?: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    unit: string;
  }>;
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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ProcurementPO[]>([]);
  const [formData, setFormData] = useState<GoodsReceiptFormData>({
    purchase_order_id: '',
    warehouse_id: '',
    supplier_name: '',
    receipt_date: new Date().toISOString().split('T')[0],
    notes: '',
    po_number: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchWarehouses();
    fetchPurchaseOrders();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Warehouse[] }>('/api/v1/masterdata/warehouses/');
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { data: ProcurementPO[] } }>('/api/v1/procurement/purchase-orders/');
      const pos = response.data?.data || [];
      // Show POs that can receive goods (approved, sent, confirmed, shipped)
      const receivablePOs = pos.filter(po =>
        ['approved', 'sent', 'confirmed', 'shipped', 'received'].includes(po.status)
      );
      setPurchaseOrders(receivablePOs);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    }
  };

  const handleInputChange = (field: keyof GoodsReceiptFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePOSelect = (poId: string) => {
    if (poId === '_none') {
      setFormData(prev => ({
        ...prev,
        purchase_order_id: '',
        supplier_name: '',
        po_number: '',
      }));
      return;
    }

    const selectedPO = purchaseOrders.find(po => po.id === poId);
    if (selectedPO) {
      setFormData(prev => ({
        ...prev,
        purchase_order_id: selectedPO.id,
        supplier_name: selectedPO.supplier_name,
        po_number: selectedPO.po_number,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouse_id) {
      alert('Please select a warehouse');
      return;
    }

    try {
      setLoading(true);

      const submitData: Record<string, unknown> = {
        warehouse_id: formData.warehouse_id,
        supplier_name: formData.supplier_name,
        receipt_date: formData.receipt_date,
        notes: formData.notes,
      };

      if (formData.purchase_order_id) {
        submitData.purchase_order_id = formData.purchase_order_id;
      }

      await goodsReceiptService.create(submitData);
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-gray-500" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="purchase_order_id">
                    Purchase Order
                  </Label>
                  <Select
                    value={formData.purchase_order_id || '_none'}
                    onValueChange={handlePOSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purchase order (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">-- No PO (Manual Receipt) --</SelectItem>
                      {mounted && purchaseOrders.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.po_number} - {po.supplier_name}
                          {mounted ? ` (${po.currency} ${po.total_amount.toLocaleString('id-ID')})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPO && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Status: <span className="capitalize">{selectedPO.status}</span> | Payment: {selectedPO.payment_terms}
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
                  {selectedWarehouse?.address && (
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedWarehouse.address}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_name">
                    Supplier Name {!selectedPO && <span className="text-muted-foreground text-xs">(auto-filled from PO)</span>}
                  </Label>
                  <Input
                    id="supplier_name"
                    type="text"
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                    className="w-full"
                    readOnly={!!selectedPO}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_date" className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-gray-500" />
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

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <HugeiconsIcon icon={File01Icon} className="w-4 h-4 text-gray-500" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes or comments..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {(selectedPO || selectedWarehouse) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receipt Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedPO && (
                    <div className="space-y-1 p-4 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">Purchase Order</div>
                      <div className="text-muted-foreground">PO Number: {selectedPO.po_number}</div>
                      <div className="text-muted-foreground">Supplier: {selectedPO.supplier_name}</div>
                      <div className="text-muted-foreground">
                        Amount: {mounted ? `${selectedPO.currency} ${selectedPO.total_amount.toLocaleString('id-ID')}` : ''}
                      </div>
                      <div className="text-muted-foreground">
                        Status: <span className="capitalize">{selectedPO.status}</span>
                      </div>
                    </div>
                  )}
                  {selectedWarehouse && (
                    <div className="space-y-1 p-4 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">Warehouse</div>
                      <div className="text-muted-foreground">{selectedWarehouse.name}</div>
                      {selectedWarehouse.address && (
                        <div className="text-muted-foreground">{selectedWarehouse.address}</div>
                      )}
                      <div className="text-muted-foreground">
                        Date: {mounted ? new Date(formData.receipt_date).toLocaleDateString('id-ID') : formData.receipt_date}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
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
              disabled={loading || !formData.warehouse_id}
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
