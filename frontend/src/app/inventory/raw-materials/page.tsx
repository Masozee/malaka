'use client';

import React, { useState, useEffect } from 'react';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Download, 
  Eye,
  Edit,
  Plus,
  RefreshCw,
  X,
  Truck,
  Warehouse
} from 'lucide-react';
import { rawMaterialService, RawMaterial, RawMaterialFilters, RawMaterialListResponse } from '@/services/raw-materials';
import type { RawMaterialCategory, RawMaterialStatus } from '@/types/raw-materials';

const getStatusBadge = (status: RawMaterialStatus) => {
  const variants = {
    in_stock: { variant: 'default' as const, label: 'In Stock', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    low_stock: { variant: 'secondary' as const, label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    out_of_stock: { variant: 'destructive' as const, label: 'Out of Stock', className: '' },
    on_order: { variant: 'outline' as const, label: 'On Order', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    expired: { variant: 'destructive' as const, label: 'Expired', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    quality_hold: { variant: 'secondary' as const, label: 'Quality Hold', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' }
  };
  
  const config = variants[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};


export default function RawMaterialsPage() {
  const [mounted, setMounted] = useState(false);
  const [materialsData, setMaterialsData] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<RawMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch raw materials data from API
  const fetchRawMaterials = async () => {
    try {
      setLoading(true);
      const response = await rawMaterialService.getAll();
      console.log('Raw materials response:', response);
      setMaterialsData(response.data);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      setMaterialsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  useEffect(() => {
    let filtered = materialsData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(item => item.supplier === selectedSupplier);
    }

    setFilteredData(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedSupplier, materialsData]);

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

  const columns = [
    {
      key: 'materialCode' as keyof RawMaterial,
      title: 'Material Code',
      render: (value: unknown, item: RawMaterial) => (
        <div className="font-medium">{item.materialCode}</div>
      )
    },
    {
      key: 'materialName' as keyof RawMaterial,
      title: 'Material Name',
      render: (value: unknown, item: RawMaterial) => (
        <div>
          <div className="font-medium">{item.materialName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category}</div>
        </div>
      )
    },
    {
      key: 'currentStock' as keyof RawMaterial,
      title: 'Stock Level',
      render: (value: unknown, item: RawMaterial) => (
        <div>
          <div className="font-medium">{item.currentStock.toLocaleString()} {item.unit}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Min: {item.minStock} | Max: {item.maxStock}
          </div>
        </div>
      )
    },
    {
      key: 'unitCost' as keyof RawMaterial,
      title: 'Unit Cost',
      render: (value: unknown, item: RawMaterial) => (
        <div className="text-right font-medium">
          {mounted ? `Rp ${item.unitCost.toLocaleString('id-ID')}` : ''}
        </div>
      )
    },
    {
      key: 'totalValue' as keyof RawMaterial,
      title: 'Total Value',
      render: (value: unknown, item: RawMaterial) => (
        <div className="text-right font-medium">
          {mounted ? `Rp ${item.totalValue.toLocaleString('id-ID')}` : ''}
        </div>
      )
    },
    {
      key: 'supplier' as keyof RawMaterial,
      title: 'Supplier',
      render: (value: unknown, item: RawMaterial) => (
        <div>
          <div className="font-medium">{item.supplier}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Lead: {item.leadTime} days
          </div>
        </div>
      )
    },
    {
      key: 'location' as keyof RawMaterial,
      title: 'Location',
      render: (value: unknown, item: RawMaterial) => (
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{item.location}</span>
        </div>
      )
    },
    {
      key: 'status' as keyof RawMaterial,
      title: 'Status',
      render: (value: unknown, item: RawMaterial) => getStatusBadge(item.status)
    },
    {
      key: 'id' as keyof RawMaterial,
      title: 'Actions',
      render: (value: unknown, item: RawMaterial) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditMaterial(item)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  
  // Get unique values for filters
  const suppliers = Array.from(new Set(materialsData.map(item => item.supplier))).sort();
  const categories = [
    { value: 'leather', label: 'Leather' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'sole', label: 'Sole' },
    { value: 'thread', label: 'Thread' },
    { value: 'adhesive', label: 'Adhesive' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'other', label: 'Other' }
  ];
  const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'on_order', label: 'On Order' },
    { value: 'expired', label: 'Expired' },
    { value: 'quality_hold', label: 'Quality Hold' }
  ];

  // Form handlers
  const handleCreateMaterial = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditMaterial = (item: RawMaterial) => {
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
        title="Raw Materials"
        description="Manage raw materials inventory for shoe production"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Raw Materials" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRawMaterials}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateMaterial}>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by material name, code, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-36">
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

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-48">
                <Truck className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSupplier !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedSupplier('all');
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

        {/* Raw Materials Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading raw materials...</p>
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
      </div>

      {/* Create Material Modal - Placeholder */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Raw Material</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Create material form will be implemented here</p>
            <Button onClick={handleCloseModals} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Material Modal - Placeholder */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Material - {editingItem?.materialName}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Edit material form will be implemented here</p>
            <Button onClick={handleCloseModals} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  );
}