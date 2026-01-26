'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PackageIcon,
  ArrowLeft01Icon,
  PrinterIcon,
  Download01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  AlertCircleIcon,
  Calendar01Icon,
  Store01Icon,
  UserIcon,
  Note01Icon,
  Tick01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import { goodsReceiptService, GoodsReceipt, GoodsReceiptItem } from '@/services/inventory';

const getStatusBadge = (status?: 'pending' | 'approved' | 'completed') => {
  const variants = {
    pending: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
      icon: Clock01Icon,
      label: 'Pending'
    },
    approved: {
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
      icon: CheckmarkCircle01Icon,
      label: 'Approved'
    },
    completed: {
      className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
      icon: CheckmarkCircle01Icon,
      label: 'Completed'
    }
  } as const;

  const config = variants[status || 'pending'];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1 w-fit`}>
      <HugeiconsIcon icon={Icon} className="w-3 h-3" />
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
      // For now we will use mock data if service fails or while developing
      const mockReceipt: GoodsReceipt = {
        id: receiptId,
        purchase_order_id: 'PO-2024-001',
        receiptNumber: `GR-${receiptId}`,
        receipt_date: '2024-07-20',
        warehouse_id: 'WH-01',
        warehouse: 'Main Warehouse',
        supplierName: 'PT Sepatu Nusantara',
        poNumber: 'PO-2024-001',
        status: 'completed',
        totalItems: 50,
        totalAmount: 22500000,
        receivedBy: 'John Doe',
        created_at: '2024-07-20T10:00:00Z',
        items: [
          { id: '1', productCode: 'SHOE-001', productName: 'Classic Oxford', quantity: 10, unitPrice: 450000, totalPrice: 4500000 },
          { id: '2', productCode: 'SHOE-002', productName: 'Running Sneaker', quantity: 20, unitPrice: 320000, totalPrice: 6400000 },
          { id: '3', productCode: 'BOOT-001', productName: 'Winter Boot', quantity: 20, unitPrice: 580000, totalPrice: 11600000 }
        ]
      };
      // In a real scenario:
      // const receiptData = await goodsReceiptService.getById(receiptId);
      // setReceipt(receiptData);

      setReceipt(mockReceipt);
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
  const itemColumns: TanStackColumn<GoodsReceiptItem>[] = useMemo(() => [
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'productCode',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600 dark:text-blue-400">{row.original.productName}</span>
          <span className="text-xs text-muted-foreground">{row.original.productCode}</span>
        </div>
      )
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.quantity}</div>
      )
    },
    {
      id: 'price',
      header: 'Unit Price',
      accessorKey: 'unitPrice',
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {((row.original.unitPrice || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      )
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'totalPrice',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {((row.original.totalPrice || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      )
    }
  ], []);

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
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error || 'Goods Receipt Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                The goods receipt you're looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
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
              <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-gray-500" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{receipt.receiptNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(receipt.status)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Order</label>
                  <p className="mt-1 text-sm">{receipt.poNumber || receipt.purchase_order_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm font-medium">{receipt.supplierName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received Date</label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-gray-400" />
                    {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse</label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Store01Icon} className="w-4 h-4 text-gray-400" />
                    {receipt.warehouse}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received By</label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-gray-400" />
                    {receipt.receivedBy || '-'}
                  </div>
                </div>
                {receipt.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    <div className="mt-1 flex items-start gap-2 text-sm p-3 bg-muted rounded-md border text-muted-foreground">
                      <HugeiconsIcon icon={Note01Icon} className="w-4 h-4 mt-0.5" />
                      {receipt.notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                <span className="text-xl font-bold">{receipt.totalItems}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {((receipt.totalAmount || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receipt Items</CardTitle>
          </CardHeader>
          <CardContent>
            {receipt.items && receipt.items.length > 0 ? (
              <TanStackDataTable
                data={receipt.items}
                columns={itemColumns}
                pagination={{
                  pageSize: 50,
                  pageIndex: 0,
                  totalRows: receipt.items.length,
                  onPageChange: () => { }
                }}
              />
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No Items Found</h3>
                <p className="text-muted-foreground">
                  This goods receipt doesn't have any items associated with it.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TwoLevelLayout>
  );
}