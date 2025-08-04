'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Package
} from 'lucide-react';
import { goodsReceiptService, GoodsReceipt, InventoryFilters } from '@/services/inventory';

// Use the GoodsReceipt interface directly as it now includes all display fields
type GoodsReceiptDisplay = GoodsReceipt;

// Mock data removed - now using real API data from backend

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
      icon: AlertCircle
    },
    completed: { 
      variant: 'default' as const, 
      label: 'Completed', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      icon: CheckCircle
    }
  } as const;
  
  const config = variants[status] || variants.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default function GoodsReceiptPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [receiptData, setReceiptData] = useState<GoodsReceiptDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<GoodsReceiptDisplay[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch goods receipt data from API
  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      const response = await goodsReceiptService.getAll();
      console.log('Goods receipt data response:', response);
      // Data is already transformed in the service
      setReceiptData(response.data);
    } catch (error) {
      console.error('Error fetching goods receipt data:', error);
      setReceiptData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptData();
  }, []);

  useEffect(() => {
    let filtered = receiptData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedStatus, receiptData]);

  const columns = [
    {
      key: 'receiptNumber' as keyof GoodsReceiptDisplay,
      title: 'Receipt Number',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="font-medium text-blue-600 dark:text-blue-400">
          {item.receiptNumber || `GR-${item.id?.slice(-8)}`}
        </div>
      )
    },
    {
      key: 'supplierName' as keyof GoodsReceiptDisplay,
      title: 'Supplier',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div>
          <div className="font-medium">{item.supplierName || 'Unknown Supplier'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">PO: {item.poNumber || item.purchase_order_id}</div>
        </div>
      )
    },
    {
      key: 'expectedDate' as keyof GoodsReceiptDisplay,
      title: 'Expected Date',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="text-sm">
          <div>{mounted && item.expectedDate ? new Date(item.expectedDate).toLocaleDateString('id-ID') : ''}</div>
          {item.receipt_date && (
            <div className="text-gray-500 dark:text-gray-400">
              Received: {mounted && item.receipt_date ? new Date(item.receipt_date).toLocaleDateString('id-ID') : ''}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'totalItems' as keyof GoodsReceiptDisplay,
      title: 'Items / Value',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="text-center">
          <div className="font-medium">{(item.totalItems || 0).toLocaleString()} items</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {mounted ? `Rp ${(item.totalAmount || 0).toLocaleString('id-ID')}` : ''}
          </div>
        </div>
      )
    },
    {
      key: 'warehouse' as keyof GoodsReceiptDisplay,
      title: 'Warehouse',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="text-sm">{item.warehouse}</div>
      )
    },
    {
      key: 'receivedBy' as keyof GoodsReceiptDisplay,
      title: 'Received By',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="text-sm">
          {item.receivedBy || (
            <span className="text-gray-400 italic">Not received</span>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof GoodsReceiptDisplay,
      title: 'Status',
      render: (value: unknown, item: GoodsReceiptDisplay) => getStatusBadge(item.status)
    },
    {
      key: 'id' as keyof GoodsReceiptDisplay,
      title: 'Actions',
      render: (value: unknown, item: GoodsReceiptDisplay) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            title="View Details"
            onClick={() => router.push(`/inventory/goods-receipt/${item.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(item.status === 'pending' || !item.status) && (
            <Button 
              variant="ghost" 
              size="sm" 
              title="Process Receipt"
              onClick={() => router.push(`/inventory/goods-receipt/${item.id}/edit`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Calculate summary statistics from real data
  const totalValue = filteredData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const pendingReceipts = filteredData.filter(item => item.status === 'pending').length;
  const completedToday = filteredData.filter(item => 
    item.status === 'completed' && 
    item.receipt_date && 
    item.receipt_date.split('T')[0] === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <TwoLevelLayout>
      <Header 
        title="Goods Receipt"
        description="Record incoming inventory and supplier deliveries"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Receipt" }
        ]}
      />
      
      <div className="flex-1 p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Receipts</p>
                  <p className="text-2xl font-bold">{filteredData.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold">{mounted ? `Rp ${totalValue.toLocaleString('id-ID')}` : ''}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Receipts</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingReceipts}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{completedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by receipt number, supplier, or PO number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/inventory/goods-receipt/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goods Receipt Table */}
        <Card>
          <CardHeader>
            <CardTitle>Goods Receipt Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading goods receipt data...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={filteredData}
                columns={columns}
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: filteredData.length,
                  onChange: (page, pageSize) => {
                    // Handle pagination change
                    console.log('Page changed:', page, pageSize);
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/inventory/goods-receipt/create')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Create New Receipt</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record a new goods receipt from supplier</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Process Pending</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review and process pending receipts</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Export Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate receipt reports and analytics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  );
}