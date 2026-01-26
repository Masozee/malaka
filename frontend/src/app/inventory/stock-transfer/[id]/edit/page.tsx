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
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft01Icon,
    FloppyDiskIcon,
    TruckDeliveryIcon,
    Calendar01Icon,
    File01Icon
} from '@hugeicons/core-free-icons';
import { stockTransferService } from '@/services/inventory';

interface StockTransferFormData {
    transfer_type: string;
    from_location_id: string;
    to_location_id: string;
    transfer_date: string;
    priority: string;
    notes: string;
    status: string;
}

interface Location {
    id: string;
    name: string;
    type: 'warehouse' | 'store';
}

export default function EditStockTransferPage() {
    const params = useParams();
    const router = useRouter();
    const transferId = params.id as string;

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<StockTransferFormData>({
        transfer_type: '',
        from_location_id: '',
        to_location_id: '',
        transfer_date: '',
        priority: 'medium',
        notes: '',
        status: 'pending'
    });

    const [locations] = useState<Location[]>([
        { id: 'wh-001', name: 'Main Warehouse Jakarta', type: 'warehouse' },
        { id: 'wh-002', name: 'Regional Warehouse Surabaya', type: 'warehouse' },
        { id: 'st-001', name: 'Store Plaza Indonesia', type: 'store' },
        { id: 'st-002', name: 'Store Grand Indonesia', type: 'store' },
        { id: 'st-003', name: 'Store Mall Kelapa Gading', type: 'store' }
    ]);

    useEffect(() => {
        setMounted(true);
        fetchTransferDetails();
    }, [transferId]);

    const fetchTransferDetails = async () => {
        try {
            setFetching(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock existing data
            const mockData = {
                id: transferId,
                transfer_type: 'warehouse_to_store',
                from_location_id: 'wh-001',
                to_location_id: 'st-001',
                transfer_date: '2024-07-25',
                priority: 'high',
                notes: 'Stock replenishment for weekend sale',
                status: 'in_transit'
            };

            setFormData({
                transfer_type: mockData.transfer_type,
                from_location_id: mockData.from_location_id,
                to_location_id: mockData.to_location_id,
                transfer_date: mockData.transfer_date,
                priority: mockData.priority,
                notes: mockData.notes,
                status: mockData.status
            });
        } catch (error) {
            console.error('Error fetching transfer details:', error);
            alert('Failed to load transfer details');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (field: keyof StockTransferFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.transfer_type || !formData.from_location_id || !formData.to_location_id) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.from_location_id === formData.to_location_id) {
            alert('Source and Destination locations cannot be the same');
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                ...formData,
                id: transferId
            };

            console.log('Updating stock transfer with data:', submitData);
            // In real app: const response = await stockTransferService.update(transferId, submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push(`/inventory/stock-transfer/${transferId}`);
        } catch (error) {
            console.error('Error updating stock transfer:', error);
            alert('Failed to update stock transfer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/inventory/stock-transfer/${transferId}`);
    };

    if (fetching) {
        return (
            <TwoLevelLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </TwoLevelLayout>
        );
    }

    return (
        <TwoLevelLayout>
            <Header
                title={`Edit Transfer ${transferId}`}
                description="Modify existing stock transfer"
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Stock Transfer", href: "/inventory/stock-transfer" },
                    { label: transferId, href: `/inventory/stock-transfer/${transferId}` },
                    { label: "Edit" }
                ]}
            />

            <div className="flex-1 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <HugeiconsIcon icon={TruckDeliveryIcon} className="w-5 h-5 text-gray-500" />
                                Transfer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-2">
                                    <Label htmlFor="transfer_type">
                                        Transfer Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.transfer_type}
                                        onValueChange={(value) => handleInputChange('transfer_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="warehouse_to_warehouse">Warehouse to Warehouse</SelectItem>
                                            <SelectItem value="warehouse_to_store">Warehouse to Store</SelectItem>
                                            <SelectItem value="store_to_store">Store to Store</SelectItem>
                                            <SelectItem value="return_to_warehouse">Return to Warehouse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">
                                        Priority <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleInputChange('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="from_location_id">
                                        From Location <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.from_location_id}
                                        onValueChange={(value) => handleInputChange('from_location_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select origin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mounted && locations.map(loc => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="to_location_id">
                                        To Location <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.to_location_id}
                                        onValueChange={(value) => handleInputChange('to_location_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mounted && locations.map(loc => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="transfer_date" className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-gray-500" />
                                        Transfer Date
                                    </Label>
                                    <Input
                                        id="transfer_date"
                                        type="date"
                                        value={formData.transfer_date}
                                        onChange={(e) => handleInputChange('transfer_date', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Status
                                    </Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="notes" className="flex items-center gap-2">
                                        <HugeiconsIcon icon={File01Icon} className="w-4 h-4 text-gray-500" />
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Enter reason or additional notes..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className="w-full min-h-[80px]"
                                        rows={3}
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </Card>

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
                            disabled={loading || !formData.transfer_type || !formData.from_location_id || !formData.to_location_id}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </TwoLevelLayout>
    );
}
