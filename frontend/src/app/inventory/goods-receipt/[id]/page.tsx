'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
;
import { goodsReceiptService, GoodsReceipt, GoodsReceiptItem } from '@/services/inventory';

const getStatusBadge = (status?: 'pending' | 'approved' | 'completed') => {
  const variants = {
    pending: { 
      variant: 'secondary' as const, 
      label: 'Pending', 
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      icon: Clock
    },
    approved: { 
      variant: 'default' as const, 
      label: 'Approved', 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      icon: WarningCircle
    },
    completed: { 
      variant: 'default' as const, 
      label: 'Completed', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      icon: CheckCircle
    }
  } as const;
  
  const config = variants[status || 'pending'];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const receiptId = params.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchReceiptDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const receiptData = await goodsReceiptService.getById(receiptId);
      console.log('Goods receipt detail response:', receiptData);
      setReceipt(receiptData);
    } catch (error) {
      console.error('Error fetching goods receipt detail:', error);
      setError('Failed to load goods receipt details');
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receiptId) {
      fetchReceiptDetail();
    }
  }, [receiptId]);

  const handleEdit = () => {
    router.push(`/inventory/goods-receipt/${receiptId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goods receipt?')) {
      try {
        await goodsReceiptService.delete(receiptId);
        router.push('/inventory/goods-receipt');
      } catch (error) {
        console.error('Error deleting goods receipt:', error);
        alert('Failed to delete goods receipt');
      }
    }
  };

  const handleBack = () => {
    router.push('/inventory/goods-receipt');
  };

  // Item columns for the items table
  const itemColumns = [
    {
      key: 'productCode' as keyof GoodsReceiptItem,
      title: 'Product Code',
      render: (value: unknown, item: GoodsReceiptItem) => (
        <div className="font-medium text-blue-600 dark:text-blue-400">
          {item.productCode}
        </div>
      )
    },
    {
      key: 'productName' as keyof GoodsReceiptItem,
      title: 'Product Name',
      render: (value: unknown, item: GoodsReceiptItem) => (
        <div className="font-medium">{item.productName}</div>
      )
    },
    {
      key: 'quantity' as keyof GoodsReceiptItem,
      title: 'Quantity',
      render: (value: unknown, item: GoodsReceiptItem) => (
        <div className="text-center font-medium">{item.quantity}</div>
      )
    },
    {
      key: 'unitPrice' as keyof GoodsReceiptItem,
      title: 'Unit Price',
      render: (value: unknown, item: GoodsReceiptItem) => (
        <div className="text-right">
          {mounted ? `Rp ${item.unitPrice.toLocaleString('id-ID')}` : ''}
        </div>
      )
    },
    {
      key: 'totalPrice' as keyof GoodsReceiptItem,
      title: 'Total Price',
      render: (value: unknown, item: GoodsReceiptItem) => (
        <div className="text-right font-medium">
          {mounted ? `Rp ${item.totalPrice.toLocaleString('id-ID')}` : ''}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Goods Receipt Details"
          description="Loading receipt information..."
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Goods Receipt", href: "/inventory/goods-receipt" },
            { label: "Details" }
          ]}
        />
        
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading goods receipt details...</p>
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
          title="Goods Receipt Details"
          description="Error loading receipt information"
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Goods Receipt", href: "/inventory/goods-receipt" },
            { label: "Details" }
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
                The goods receipt you're looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
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
        title={`Goods Receipt ${receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`}`}
        description="Detailed view of goods receipt information"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Receipt", href: "/inventory/goods-receipt" },
          { label: receipt.receiptNumber || "Details" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <DownloadSimple className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <PencilSimple className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Receipt Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Receipt Number</label>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(receipt.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchase Order</label>
                  <p className="text-base font-medium">
                    {receipt.poNumber || receipt.purchase_order_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier</label>
                  <p className="text-base font-medium">
                    {receipt.supplierName || 'Unknown Supplier'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Receipt Date</label>
                  <p className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {mounted && receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Warehouse</label>
                  <p className="text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {receipt.warehouse || 'Main Warehouse'}
                  </p>
                </div>
                {receipt.receivedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Received By</label>
                    <p className="text-base font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {receipt.receivedBy}
                    </p>
                  </div>
                )}
                {receipt.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                    <p className="text-base font-medium flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1" />
                      {receipt.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {receipt.totalItems || (receipt.items?.length || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mounted ? `Rp ${(receipt.totalAmount || 0).toLocaleString('id-ID')}` : ''}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium">
                  {mounted && receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('id-ID') : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Items */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Items</CardTitle>
          </CardHeader>
          <CardContent>
            {receipt.items && receipt.items.length > 0 ? (
              <DataTable
                data={receipt.items}
                columns={itemColumns}
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: receipt.items.length,
                  onChange: (page, pageSize) => {
                    console.log('Page changed:', page, pageSize);
                  }
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Items Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This goods receipt doesn't have any items associated with it yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <Button onClick={handleEdit}>
            <PencilSimple className="w-4 h-4 mr-2" />
            Edit Receipt
          </Button>
        </div>
      </div>
    </TwoLevelLayout>
  );
}