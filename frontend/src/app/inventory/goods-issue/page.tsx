'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Truck,
  Package
} from 'lucide-react';
import { goodsIssueService, GoodsIssue, InventoryFilters } from '@/services/inventory';

// Extended interface for display purposes
interface GoodsIssueDisplay extends GoodsIssue {
  customerName?: string;
  orderNumber?: string;
  requestedDate?: string;
  issuedBy?: string;
  warehouse?: string;
  issueType?: 'sales_order' | 'transfer' | 'return' | 'adjustment';
  notes?: string;
}

// Mock data removed - now using real API data from backend

const getStatusBadge = (status: GoodsIssue['status']) => {
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

const getIssueTypeBadge = (type: GoodsIssue['issueType']) => {
  const variants = {
    sales_order: { label: 'Sales Order', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    transfer: { label: 'Transfer', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
    return: { label: 'Return', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
    adjustment: { label: 'Adjustment', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
  };
  
  const config = variants[type];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function GoodsIssuePage() {
  const [mounted, setMounted] = useState(false);
  const [issueData, setIssueData] = useState<GoodsIssueDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<GoodsIssueDisplay[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch goods issue data from API
  const fetchIssueData = async () => {
    try {
      setLoading(true);
      const response = await goodsIssueService.getAll();
      console.log('Goods issue data response:', response);
      // Transform data to include display fields
      const transformedData: GoodsIssueDisplay[] = response.data.map(item => ({
        ...item,
        customerName: item.customerName || '',
        orderNumber: item.orderNumber || 'N/A',
        requestedDate: item.requestedDate || item.issueDate,
        issuedBy: item.issuedBy || '',
        warehouse: item.warehouse || 'Main Warehouse',
        issueType: item.issueType || 'sales_order',
        notes: item.notes || ''
      }));
      setIssueData(transformedData);
    } catch (error) {
      console.error('Error fetching goods issue data:', error);
      setIssueData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueData();
  }, []);

  useEffect(() => {
    let filtered = issueData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customerName && item.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.orderNumber && item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.issueType === selectedType);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedStatus, selectedType, issueData]);

  const columns = [
    {
      key: 'issueNumber' as keyof GoodsIssueDisplay,
      title: 'Issue Number',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="font-medium text-blue-600 dark:text-blue-400">
          {item.issueNumber}
        </div>
      )
    },
    {
      key: 'customerName' as keyof GoodsIssueDisplay,
      title: 'Customer / Order',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div>
          <div className="font-medium">
            {item.customerName || <span className="text-gray-400 italic">Internal</span>}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {item.orderNumber}
          </div>
        </div>
      )
    },
    {
      key: 'requestedDate' as keyof GoodsIssueDisplay,
      title: 'Requested Date',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="text-sm">
          <div>{mounted && item.requestedDate ? new Date(item.requestedDate).toLocaleDateString('id-ID') : ''}</div>
          {item.issueDate && (
            <div className="text-gray-500 dark:text-gray-400">
              Issued: {mounted && item.issueDate ? new Date(item.issueDate).toLocaleDateString('id-ID') : ''}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'totalItems' as keyof GoodsIssueDisplay,
      title: 'Items / Value',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="text-center">
          <div className="font-medium">{(item.totalItems || 0).toLocaleString()} items</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ${((item.totalItems || 0) * 45).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      )
    },
    {
      key: 'issueType' as keyof GoodsIssueDisplay,
      title: 'Type',
      render: (value: unknown, item: GoodsIssueDisplay) => getIssueTypeBadge(item.issueType || 'sales_order')
    },
    {
      key: 'warehouse' as keyof GoodsIssueDisplay,
      title: 'Warehouse',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="text-sm">{item.warehouse}</div>
      )
    },
    {
      key: 'issuedBy' as keyof GoodsIssueDisplay,
      title: 'Issued By',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="text-sm">
          {item.issuedBy || (
            <span className="text-gray-400 italic">Not issued</span>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof GoodsIssueDisplay,
      title: 'Status',
      render: (value: unknown, item: GoodsIssueDisplay) => getStatusBadge(item.status)
    },
    {
      key: 'id' as keyof GoodsIssueDisplay,
      title: 'Actions',
      render: (value: unknown, item: GoodsIssueDisplay) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="View Details">
            <Eye className="w-4 h-4" />
          </Button>
          {item.status === 'pending' && (
            <Button variant="ghost" size="sm" title="Process Issue">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Calculate summary statistics from real data
  const totalValue = filteredData.reduce((sum, item) => sum + ((item.totalItems || 0) * 45), 0);
  const pendingIssues = filteredData.filter(item => item.status === 'pending').length;
  const completedToday = filteredData.filter(item => 
    item.status === 'completed' && 
    item.issueDate && 
    item.issueDate.split('T')[0] === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <TwoLevelLayout>
      <Header 
        title="Goods Issue"
        description="Process outgoing inventory and shipments"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Goods Issue" }
        ]}
      />
      
      <div className="flex-1 p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Issues</p>
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
                  <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Issues</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingIssues}</p>
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
                    placeholder="Search by issue number, customer, or order number..."
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

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="sales_order">Sales Order</option>
                  <option value="transfer">Transfer</option>
                  <option value="return">Return</option>
                  <option value="adjustment">Adjustment</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goods Issue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Goods Issue Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading goods issue data...</p>
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
          <Card className="hover: transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Create New Issue</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record a new goods issue or shipment</p>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Process Pending</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review and process pending issues</p>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Shipment Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track outbound shipments and deliveries</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  );
}