'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Clock01Icon,
  LocationIcon,
  UserGroupIcon,
  FileIcon
} from "@hugeicons/core-free-icons"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
;

// Updated to match backend DTO structure
export interface EventFormData {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  type: 'event' | 'meeting' | 'task' | 'reminder' | 'holiday';
  priority: 'low' | 'medium' | 'high';
  isAllDay?: boolean;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  selectedDate?: Date;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  date: new Date(),
  location: '',
  type: 'event',
  priority: 'medium',
  isAllDay: false,
  attendees: []
};

const eventTypes = [
  { value: 'event', label: 'Event', icon: Calendar01Icon },
  { value: 'meeting', label: 'Meeting', icon: UserGroupIcon },
  { value: 'task', label: 'Task', icon: FileIcon },
  { value: 'reminder', label: 'Reminder', icon: Clock01Icon }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' }
];

export function EventForm({ open, onOpenChange, onSubmit, initialData, selectedDate }: EventFormProps) {
  const [formData, setFormData] = React.useState<EventFormData>(initialFormData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Set initial date when selectedDate is provided
  React.useEffect(() => {
    if (selectedDate && open) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate, open]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialFormData, ...initialData });
      } else {
        const initialDate = selectedDate || new Date();
        setFormData({ ...initialFormData, date: initialDate });
      }
      setErrors({});
    }
  }, [open, initialData, selectedDate]);

  const updateField = (field: keyof EventFormData, value: string | Date | boolean | Array<{ id: string; name: string; email: string; }> | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.endDate && formData.date && formData.endDate <= formData.date) {
      newErrors.endDate = 'End date/time must be after start date/time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const selectedEventType = eventTypes.find(type => type.value === formData.type);
  const IconData = selectedEventType?.icon || Calendar01Icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={IconData} className="w-5 h-5" />
            {initialData ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter event title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: EventFormData['type']) => updateField('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={type.icon} className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: EventFormData['priority']) => updateField('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date.toISOString().slice(0, 16)}
                onChange={(e) => updateField('date', new Date(e.target.value))}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate ? formData.endDate.toISOString().slice(0, 16) : ''}
                onChange={(e) => updateField('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay || false}
              onChange={(e) => updateField('isAllDay', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isAllDay">All day event</Label>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <HugeiconsIcon icon={LocationIcon} className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Enter event location"
            />
          </div>

          {/* Attendees */}
          {formData.type === 'meeting' && (
            <div className="space-y-2">
              <Label htmlFor="attendees" className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                Attendees
              </Label>
              <Input
                id="attendees"
                value={formData.attendees?.map(a => a.email).join(', ') || ''}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                  const attendees = emails.map((email, index) => ({
                    id: `temp-${index}`,
                    name: email.split('@')[0],
                    email
                  }));
                  updateField('attendees', attendees);
                }}
                placeholder="Enter attendee emails (comma separated)"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}