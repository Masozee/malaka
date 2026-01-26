'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlusSignIcon,
  Search01Icon,
  Mail01Icon,
  RefreshIcon,
  Delete01Icon,
  Cancel01Icon,
  UserIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { invitationService, Invitation } from '@/services/invitations'
import { useAuth } from '@/contexts/auth-context'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  revoked: 'bg-red-100 text-red-800',
}

const statusIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  pending: Clock01Icon,
  accepted: CheckmarkCircle01Icon,
  expired: AlertCircleIcon,
  revoked: Cancel01Icon,
}

export default function InvitationsPage() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [total, setTotal] = useState(0)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'staff',
    message: '',
  })

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string | number> = {
        limit: 50,
        offset: 0,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      if (searchTerm) {
        params.email = searchTerm
      }

      const response = await invitationService.listInvitations(params)
      setInvitations(response.invitations || [])
      setTotal(response.total || 0)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm])

  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])

  const handleCreateInvitation = async () => {
    if (!newInvitation.email) {
      setError('Email is required')
      return
    }

    // Use user's company_id if available, otherwise use a default (for testing)
    const companyId = user?.company_id || 'default-company-id'

    try {
      setIsSubmitting(true)
      setError(null)

      await invitationService.createInvitation({
        email: newInvitation.email,
        role: newInvitation.role,
        company_id: companyId,
        message: newInvitation.message || undefined,
      })

      setShowCreateDialog(false)
      setNewInvitation({ email: '', role: 'staff', message: '' })
      loadInvitations()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setError(error.response?.data?.message || error.message || 'Failed to create invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvitation = async (id: string) => {
    try {
      setIsSubmitting(true)
      await invitationService.resendInvitation(id)
      loadInvitations()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to resend invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeInvitation = async (id: string) => {
    try {
      setIsSubmitting(true)
      await invitationService.revokeInvitation(id)
      loadInvitations()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to revoke invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteInvitation = async () => {
    if (!selectedInvitation) return

    try {
      setIsSubmitting(true)
      await invitationService.deleteInvitation(selectedInvitation.id)
      setShowDeleteDialog(false)
      setSelectedInvitation(null)
      loadInvitations()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to delete invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pendingCount = invitations.filter((i) => i.status === 'pending').length
  const acceptedCount = invitations.filter((i) => i.status === 'accepted').length

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="User Invitations"
          breadcrumbs={[
            { label: 'Settings', href: '/settings' },
            { label: 'Invitations' },
          ]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">{acceptedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {total > 0 ? Math.round((acceptedCount / total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
                />
                <Input
                  placeholder="Search by email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => loadInvitations()} variant="outline" disabled={loading}>
              <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={() => setShowCreateDialog(true)}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Invitations Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <HugeiconsIcon icon={Mail01Icon} className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invitations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by inviting users to join your organization
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Invited By</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Expires</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((invitation) => {
                        const StatusIcon = statusIcons[invitation.status] || Clock01Icon
                        return (
                          <tr key={invitation.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">{invitation.email}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="capitalize">
                                {invitation.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge className={statusColors[invitation.status]}>
                                <HugeiconsIcon icon={StatusIcon} className="h-3 w-3 mr-1" />
                                {invitation.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{invitation.inviter_name || '-'}</td>
                            <td className="p-3 text-muted-foreground">{formatDate(invitation.created_at)}</td>
                            <td className="p-3 text-muted-foreground">{formatDate(invitation.expires_at)}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {invitation.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResendInvitation(invitation.id)}
                                      disabled={isSubmitting}
                                      title="Resend invitation"
                                    >
                                      <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRevokeInvitation(invitation.id)}
                                      disabled={isSubmitting}
                                      title="Revoke invitation"
                                    >
                                      <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvitation(invitation)
                                    setShowDeleteDialog(true)
                                  }}
                                  disabled={isSubmitting}
                                  title="Delete invitation"
                                >
                                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Invitation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new user. They will receive a link to create their
              account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newInvitation.role}
                onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Input
                id="message"
                placeholder="Welcome to our team!"
                value={newInvitation.message}
                onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvitation} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the invitation for{' '}
              <strong>{selectedInvitation?.email}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvitation} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}
