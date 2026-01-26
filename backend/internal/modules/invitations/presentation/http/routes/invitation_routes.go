package routes

// Note: Invitation routes are registered directly in server.go
// This file is kept for documentation purposes and potential future use
// with route registration patterns similar to other modules.

// Public routes (no auth required):
// - GET  /api/v1/invitations/validate/:token - Validate an invitation token
// - POST /api/v1/invitations/accept          - Accept invitation and create user

// Protected routes (auth required):
// - POST   /api/v1/invitations              - Create a new invitation
// - GET    /api/v1/invitations              - List all invitations
// - GET    /api/v1/invitations/:id          - Get invitation details
// - POST   /api/v1/invitations/:id/revoke   - Revoke a pending invitation
// - POST   /api/v1/invitations/:id/resend   - Resend invitation email
// - DELETE /api/v1/invitations/:id          - Delete an invitation
