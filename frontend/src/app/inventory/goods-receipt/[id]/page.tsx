'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  PrinterIcon,
  Download01Icon,
  AlertCircleIcon,
  Share01Icon,
} from '@hugeicons/core-free-icons';
import { goodsReceiptService, GoodsReceipt, GoodsReceiptItem } from '@/services/inventory';
import { ShareToChat } from '@/components/messaging/ShareToChat';
import type { EntityRef } from '@/services/messaging';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200' },
  POSTED: { label: 'Posted', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
};

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const receiptId = params.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchReceiptDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goodsReceiptService.getById(receiptId);
      // The API returns a map with camelCase keys from GetByIDWithDetails
      const receiptData: GoodsReceipt = {
        id: (data as any).id,
        purchase_order_id: (data as any).purchase_order_id || '',
        receipt_date: (data as any).receipt_date,
        warehouse_id: (data as any).warehouse_id || '',
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
        receiptNumber: (data as any).gr_number || (data as any).receiptNumber,
        supplierName: (data as any).supplierName,
        poNumber: (data as any).poNumber,
        warehouse: (data as any).warehouse,
        status: (data as any).status,
        totalItems: (data as any).totalItems || 0,
        totalAmount: (data as any).totalAmount || 0,
        notes: (data as any).notes,
        items: ((data as any).items || []).map((item: any) => ({
          id: item.id,
          productCode: item.productCode || 'N/A',
          productName: item.productName || 'Unknown',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0,
        })),
      };
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
    if (receipt?.status !== 'DRAFT') {
      addToast({ type: 'error', title: 'Only draft receipts can be edited' });
      return;
    }
    router.push(`/inventory/goods-receipt/${receiptId}/edit`);
  };

  const handlePost = async () => {
    if (receipt?.status !== 'DRAFT') return;
    if (!confirm('Post this goods receipt? This will update stock and create journal entries.')) return;

    try {
      await apiClient.post(`/api/v1/inventory/goods-receipts/${receiptId}/post`, {});
      addToast({ type: 'success', title: 'Goods receipt posted successfully' });
      fetchReceiptDetail();
    } catch (error) {
      console.error('Error posting goods receipt:', error);
      addToast({ type: 'error', title: 'Failed to post goods receipt' });
    }
  };

  const handleDelete = async () => {
    if (receipt?.status !== 'DRAFT') {
      addToast({ type: 'error', title: 'Only draft receipts can be deleted' });
      return;
    }

    if (confirm('Are you sure you want to delete this goods receipt?')) {
      try {
        await goodsReceiptService.delete(receiptId);
        addToast({ type: 'success', title: 'Goods receipt deleted successfully' });
        router.push('/inventory/goods-receipt');
      } catch (error) {
        console.error('Error deleting goods receipt:', error);
        addToast({ type: 'error', title: 'Failed to delete goods receipt' });
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

  const statusBadge = statusConfig[receipt.status || 'DRAFT'] || statusConfig.DRAFT;
  const isDraft = receipt.status === 'DRAFT';

  return (
    <TwoLevelLayout>
      <Header
        title={receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`}
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Receipt", href: "/inventory/goods-receipt" },
          { label: receipt.receiptNumber || "Details" }
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Goods Receipt
        </button>

        {/* Page title + actions */}
        <div className="flex items-start justify-between -mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`}
              </h1>
              <Badge className={`${statusBadge.color} border-0`}>{statusBadge.label}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Goods receipt details and item information</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                <HugeiconsIcon icon={Share01Icon} className="w-4 h-4" />
                Share
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4" />
                Print
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <button
                className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Info + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receipt Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Receipt Information</CardTitle>
              <CardDescription>Purchase order, supplier, and warehouse details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{receipt.receiptNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received Date</label>
                  <p className="mt-1 text-sm">
                    {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </p>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse</label>
                  <p className="mt-1 text-sm">{receipt.warehouse}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received By</label>
                  <p className="mt-1 text-sm">{receipt.receivedBy || '-'}</p>
                </div>
                {receipt.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    <p className="mt-1 text-sm p-3 bg-muted rounded-md border text-muted-foreground">
                      {receipt.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {isDraft && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handlePost}>
                    Post Receipt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleEdit}>
                    Edit
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
                <CardDescription>Items and value overview</CardDescription>
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
        </div>

        {/* Receipt Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receipt Items ({receipt.items?.length || 0})</CardTitle>
            <CardDescription>Products received in this goods receipt</CardDescription>
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
              <div className="text-center py-8 text-muted-foreground">
                No items found for this goods receipt.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareToChat
          entityRef={{
            type: 'goods_receipt',
            id: receipt.id,
            title: receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`,
            subtitle: receipt.supplierName || 'No supplier',
            status: receipt.status,
            status_color: receipt.status === 'completed' ? 'green' : receipt.status === 'pending' ? 'yellow' : 'gray',
            url: `/inventory/goods-receipt/${receipt.id}`,
          } as EntityRef}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </TwoLevelLayout>
  );
}