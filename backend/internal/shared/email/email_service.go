package email

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
	"strconv"
)

// EmailService handles sending emails via SMTP
type EmailService struct {
	host     string
	port     int
	username string
	password string
	fromName string
	fromEmail string
}

// EmailConfig holds email configuration
type EmailConfig struct {
	Host      string
	Port      int
	Username  string
	Password  string
	FromName  string
	FromEmail string
}

// NewEmailService creates a new email service instance
func NewEmailService(config EmailConfig) *EmailService {
	return &EmailService{
		host:      config.Host,
		port:      config.Port,
		username:  config.Username,
		password:  config.Password,
		fromName:  config.FromName,
		fromEmail: config.FromEmail,
	}
}

// NewEmailServiceFromEnv creates email service from environment variables
func NewEmailServiceFromEnv() *EmailService {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if port == 0 {
		port = 587
	}

	return &EmailService{
		host:      os.Getenv("SMTP_HOST"),
		port:      port,
		username:  os.Getenv("SMTP_USERNAME"),
		password:  os.Getenv("SMTP_PASSWORD"),
		fromName:  os.Getenv("SMTP_FROM_NAME"),
		fromEmail: os.Getenv("SMTP_FROM_EMAIL"),
	}
}

// SendEmail sends a plain text email
func (s *EmailService) SendEmail(to, subject, body string) error {
	return s.sendMail(to, subject, body, "text/plain")
}

// SendHTMLEmail sends an HTML email
func (s *EmailService) SendHTMLEmail(to, subject, htmlBody string) error {
	return s.sendMail(to, subject, htmlBody, "text/html")
}

// sendMail is the internal method that handles the actual email sending
func (s *EmailService) sendMail(to, subject, body, contentType string) error {
	// Build the email headers
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = fmt.Sprintf("%s; charset=\"utf-8\"", contentType)

	// Build the message
	var message bytes.Buffer
	for k, v := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")
	message.WriteString(body)

	// Create authentication
	auth := smtp.PlainAuth("", s.username, s.password, s.host)

	// Connect to the server with TLS
	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	// For Gmail, we need to use STARTTLS
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         s.host,
	}

	// Connect to SMTP server
	conn, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Start TLS
	if err = conn.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("failed to start TLS: %w", err)
	}

	// Authenticate
	if err = conn.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate: %w", err)
	}

	// Set sender and recipient
	if err = conn.Mail(s.fromEmail); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}
	if err = conn.Rcpt(to); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send the email body
	w, err := conn.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %w", err)
	}
	_, err = w.Write(message.Bytes())
	if err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("failed to close data writer: %w", err)
	}

	return conn.Quit()
}

// InvitationEmailData holds data for invitation email template
type InvitationEmailData struct {
	RecipientName   string
	InviterName     string
	CompanyName     string
	Role            string
	InvitationLink  string
	ExpiryHours     int
}

// SendInvitationEmail sends an invitation email to a new user
func (s *EmailService) SendInvitationEmail(to string, data InvitationEmailData) error {
	subject := fmt.Sprintf("You're invited to join %s on Malaka ERP", data.CompanyName)

	htmlBody, err := s.renderInvitationTemplate(data)
	if err != nil {
		return fmt.Errorf("failed to render invitation template: %w", err)
	}

	return s.SendHTMLEmail(to, subject, htmlBody)
}

// renderInvitationTemplate renders the invitation email HTML template
func (s *EmailService) renderInvitationTemplate(data InvitationEmailData) (string, error) {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to Malaka ERP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0099ff; padding: 30px 40px; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                Malaka<span style="font-weight: 400;">ERP</span>
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                You're Invited!
                            </h2>

                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                Hi{{if .RecipientName}} {{.RecipientName}}{{end}},
                            </p>

                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                <strong>{{.InviterName}}</strong> has invited you to join <strong>{{.CompanyName}}</strong> on Malaka ERP as a <strong>{{.Role}}</strong>.
                            </p>

                            <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                Malaka ERP is a comprehensive enterprise resource planning system designed for efficient business operations.
                            </p>

                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td style="background-color: #0099ff; border-radius: 6px;">
                                        <a href="{{.InvitationLink}}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                                            Accept Invitation & Create Account
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; color: #888888; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 30px 0; color: #0099ff; font-size: 14px; word-break: break-all;">
                                {{.InvitationLink}}
                            </p>

                            <div style="padding: 20px; background-color: #fff8e1; border-radius: 6px; border-left: 4px solid #ffc107;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    <strong>⏰ This invitation expires in {{.ExpiryHours}} hours.</strong><br>
                                    Please complete your registration before it expires.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0; color: #888888; font-size: 14px;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; color: #888888; font-size: 12px;">
                                © 2024 Malaka ERP. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

	t, err := template.New("invitation").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}
