'use client';

import React, { useState, useEffect } from 'react';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  Eye,
  Edit,
  Warehouse,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { stockService, StockItem, InventoryFilters } from '@/services/inventory';

// Extended interface for display purposes
interface StockItemDisplay extends StockItem {
  category: string;
  warehouse: string;
}

// Mock data removed - now using real API data from backend

const getStatusBadge = (status: StockItem['status']) => {
  const variants = {
    in_stock: { variant: 'default' as const, label: 'In Stock', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    low_stock: { variant: 'secondary' as const, label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    out_of_stock: { variant: 'destructive' as const, label: 'Out of Stock', className: '' },
    overstock: { variant: 'default' as const, label: 'Overstock', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
  };
  
  const config = variants[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function StockControlPage() {
  const [mounted, setMounted] = useState(false);
  const [stockData, setStockData] = useState<StockItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<StockItemDisplay[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItemDisplay | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch stock data from API
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await stockService.getAll();
      console.log('Stock data response:', response);
      // Transform data to include display fields
      const transformedData: StockItemDisplay[] = response.data.map(item => ({
        ...item,
        category: item.category || 'General',
        warehouse: item.warehouse || 'Main Warehouse'
      }));
      setStockData(transformedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    let filtered = stockData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter(item => item.warehouse === selectedWarehouse);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredData(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedWarehouse, selectedStatus, selectedCategory, stockData]);

  const columns = [
    {
      key: 'code' as keyof StockItemDisplay,
      title: 'Product Code',
      render: (value: unknown, item: StockItemDisplay) => (
        <div className="font-medium">{item.code}</div>
      )
    },
    {
      key: 'name' as keyof StockItemDisplay,
      title: 'Product Name',
      render: (value: unknown, item: StockItemDisplay) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
        </div>
      )
    },
    {
      key: 'warehouse' as keyof StockItem,
      title: 'Warehouse',
      render: (value: unknown, item: StockItem) => (
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{item.warehouse}</span>
        </div>
      )
    },
    {
      key: 'currentStock' as keyof StockItem,
      title: 'Current Stock',
      render: (value: unknown, item: StockItem) => (
        <div className="text-center">
          <div className="font-medium">{item.currentStock.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Min: {item.minStock || 0} | Max: {item.maxStock || 0}
          </div>
        </div>
      )
    },
    {
      key: 'unitCost' as keyof StockItem,
      title: 'Unit Cost',
      render: (value: unknown, item: StockItem) => (
        <div className="text-right font-medium">
          {mounted ? `Rp ${(item.unitCost || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
        </div>
      )
    },
    {
      key: 'totalValue' as keyof StockItem,
      title: 'Total Value',
      render: (value: unknown, item: StockItem) => (
        <div className="text-right font-medium">
          {mounted ? `Rp ${(item.totalValue || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
        </div>
      )
    },
    {
      key: 'status' as keyof StockItem,
      title: 'Status',
      render: (value: unknown, item: StockItem) => getStatusBadge(item.status)
    },
    {
      key: 'id' as keyof StockItem,
      title: 'Actions',
      render: (value: unknown, item: StockItem) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditStock(item as StockItemDisplay)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  // Calculate summary statistics from real data
  const totalValue = filteredData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const lowStockItems = filteredData.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
  const warehouses = Array.from(new Set(stockData.map(item => item.warehouse))).length;

  // Pagination logic
  const totalItems = filteredData.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination handler
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };
  
  // Get unique values for filters
  const uniqueWarehouses = Array.from(new Set(stockData.map(item => item.warehouse))).sort();
  const uniqueCategories = Array.from(new Set(stockData.map(item => item.category))).sort();
  const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'overstock', label: 'Overstock' }
  ];

  // Form handlers
  const handleCreateStock = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStock = (item: StockItemDisplay) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <TwoLevelLayout>
      <Header 
        title="Stock Control"
        description="Monitor and manage inventory levels across all locations"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Stock Control" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchStockData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateStock}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
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
                  <p className="text-2xl font-bold">
                    {mounted ? `Rp ${totalValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Warehouses</p>
                  <p className="text-2xl font-bold">{warehouses || 0}</p>
                </div>
                <Warehouse className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, code, category, or warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-48">
                <Warehouse className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {uniqueWarehouses.map(warehouse => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-36">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || selectedWarehouse !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWarehouse('all');
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stock Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading stock data...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={paginatedData}
                columns={columns}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalItems,
                  onChange: handlePageChange
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Stock Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article">Article</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select article" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nike-air-max-39">Nike Air Max 39</SelectItem>
                  <SelectItem value="nike-air-max-40">Nike Air Max 40</SelectItem>
                  <SelectItem value="casual-walker-40">Casual Walker 40</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueWarehouses.map(warehouse => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
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
                placeholder="Enter quantity"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="Enter minimum stock level"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock</Label>
              <Input
                id="maxStock"
                type="number"
                placeholder="Enter maximum stock level"
                min="0"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseModals}>
                Cancel
              </Button>
              <Button onClick={handleCloseModals}>
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stock - {editingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-article">Article</Label>
              <Input
                id="edit-article"
                value={editingItem?.name || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-warehouse">Warehouse</Label>
              <Input
                id="edit-warehouse"
                value={editingItem?.warehouse || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Current Stock</Label>
              <Input
                id="edit-quantity"
                type="number"
                defaultValue={editingItem?.currentStock || 0}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Minimum Stock</Label>
              <Input
                id="edit-minStock"
                type="number"
                defaultValue={editingItem?.minStock || 0}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-maxStock">Maximum Stock</Label>
              <Input
                id="edit-maxStock"
                type="number"
                defaultValue={editingItem?.maxStock || 0}
                min="0"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseModals}>
                Cancel
              </Button>
              <Button onClick={handleCloseModals}>
                Update Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  );
}