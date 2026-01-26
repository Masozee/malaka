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
    ArrowLeft01Icon,
    FloppyDiskIcon,
    TruckDeliveryIcon,
    Store01Icon,
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
    notes?: string;
}

interface Location {
    id: string;
    name: string;
    type: 'warehouse' | 'store';
}

export default function CreateStockTransferPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<StockTransferFormData>({
        transfer_type: '',
        from_location_id: '',
        to_location_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        notes: ''
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
    }, []);

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
                transferType: formData.transfer_type,
                fromWarehouse: formData.from_location_id, // simplified mapping
                toWarehouse: formData.to_location_id,     // simplified mapping
                transferDate: formData.transfer_date,
                priority: formData.priority,
                notes: formData.notes,
                totalItems: 0 // Initial creation might have 0 items
            };

            console.log('Creating stock transfer with data:', submitData);
            // In real app: const response = await stockTransferService.create(submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push('/inventory/stock-transfer');
        } catch (error) {
            console.error('Error creating stock transfer:', error);
            alert('Failed to create stock transfer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/inventory/stock-transfer');
    };

    // Filter locations based on transfer type if needed (e.g. WH to Store)
    // For simplicity allowing all for now or basic filtering could be added

    return (
        <TwoLevelLayout>
            <Header
                title="Create Stock Transfer"
                description="Initiate a new inventory transfer"
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Stock Transfer", href: "/inventory/stock-transfer" },
                    { label: "Create" }
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
                            Create Transfer
                        </Button>
                    </div>
                </form>
            </div>
        </TwoLevelLayout>
    );
}
