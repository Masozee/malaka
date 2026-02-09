package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterFinanceRoutes registers the finance routes.
func RegisterFinanceRoutes(router *gin.RouterGroup, cashBankHandler *handlers.CashBankHandler, paymentHandler *handlers.PaymentHandler, invoiceHandler *handlers.InvoiceHandler, accountsPayableHandler *handlers.AccountsPayableHandler, accountsReceivableHandler *handlers.AccountsReceivableHandler, cashDisbursementHandler *handlers.CashDisbursementHandler, cashReceiptHandler *handlers.CashReceiptHandler, bankTransferHandler *handlers.BankTransferHandler, cashOpeningBalanceHandler *handlers.CashOpeningBalanceHandler, purchaseVoucherHandler *handlers.PurchaseVoucherHandler, expenditureRequestHandler *handlers.ExpenditureRequestHandler, checkClearanceHandler *handlers.CheckClearanceHandler, monthlyClosingHandler *handlers.MonthlyClosingHandler, cashBookHandler *handlers.CashBookHandler, rbacSvc *auth.RBACService) {
	finance := router.Group("/finance")
	finance.Use(auth.RequireModuleAccess(rbacSvc, "finance"))
	{
		// Cash/Bank routes
		cashBank := finance.Group("/cash-banks")
		{
			cashBank.POST("/", auth.RequirePermission(rbacSvc, "finance.cash-bank.create"), cashBankHandler.CreateCashBank)
			cashBank.GET("/:id", auth.RequirePermission(rbacSvc, "finance.cash-bank.read"), cashBankHandler.GetCashBankByID)
			cashBank.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.cash-bank.update"), cashBankHandler.UpdateCashBank)
			cashBank.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.cash-bank.delete"), cashBankHandler.DeleteCashBank)
		}

		// Payment routes
		payment := finance.Group("/payments")
		{
			payment.POST("/", auth.RequirePermission(rbacSvc, "finance.payment.create"), paymentHandler.CreatePayment)
			payment.GET("/:id", auth.RequirePermission(rbacSvc, "finance.payment.read"), paymentHandler.GetPaymentByID)
			payment.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.payment.update"), paymentHandler.UpdatePayment)
			payment.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.payment.delete"), paymentHandler.DeletePayment)
		}

		// Invoice routes
		invoice := finance.Group("/invoices")
		{
			invoice.POST("/", auth.RequirePermission(rbacSvc, "finance.invoice.create"), invoiceHandler.CreateInvoice)
			invoice.GET("/:id", auth.RequirePermission(rbacSvc, "finance.invoice.read"), invoiceHandler.GetInvoiceByID)
			invoice.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.invoice.update"), invoiceHandler.UpdateInvoice)
			invoice.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.invoice.delete"), invoiceHandler.DeleteInvoice)
		}

		// Accounts Payable routes
		accountsPayable := finance.Group("/accounts-payable")
		{
			accountsPayable.POST("/", auth.RequirePermission(rbacSvc, "finance.accounts-payable.create"), accountsPayableHandler.CreateAccountsPayable)
			accountsPayable.GET("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-payable.read"), accountsPayableHandler.GetAccountsPayableByID)
			accountsPayable.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-payable.update"), accountsPayableHandler.UpdateAccountsPayable)
			accountsPayable.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-payable.delete"), accountsPayableHandler.DeleteAccountsPayable)
		}

		// Accounts Receivable routes
		accountsReceivable := finance.Group("/accounts-receivable")
		{
			accountsReceivable.POST("/", auth.RequirePermission(rbacSvc, "finance.accounts-receivable.create"), accountsReceivableHandler.CreateAccountsReceivable)
			accountsReceivable.GET("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-receivable.read"), accountsReceivableHandler.GetAccountsReceivableByID)
			accountsReceivable.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-receivable.update"), accountsReceivableHandler.UpdateAccountsReceivable)
			accountsReceivable.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.accounts-receivable.delete"), accountsReceivableHandler.DeleteAccountsReceivable)
		}

		// Cash Disbursement routes
		cashDisbursement := finance.Group("/cash-disbursements")
		{
			cashDisbursement.POST("/", auth.RequirePermission(rbacSvc, "finance.cash-disbursement.create"), cashDisbursementHandler.CreateCashDisbursement)
			cashDisbursement.GET("/:id", auth.RequirePermission(rbacSvc, "finance.cash-disbursement.read"), cashDisbursementHandler.GetCashDisbursementByID)
			cashDisbursement.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.cash-disbursement.update"), cashDisbursementHandler.UpdateCashDisbursement)
			cashDisbursement.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.cash-disbursement.delete"), cashDisbursementHandler.DeleteCashDisbursement)
		}

		// Cash Receipt routes
		cashReceipt := finance.Group("/cash-receipts")
		{
			cashReceipt.POST("/", auth.RequirePermission(rbacSvc, "finance.cash-receipt.create"), cashReceiptHandler.CreateCashReceipt)
			cashReceipt.GET("/:id", auth.RequirePermission(rbacSvc, "finance.cash-receipt.read"), cashReceiptHandler.GetCashReceiptByID)
			cashReceipt.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.cash-receipt.update"), cashReceiptHandler.UpdateCashReceipt)
			cashReceipt.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.cash-receipt.delete"), cashReceiptHandler.DeleteCashReceipt)
		}

		// Bank Transfer routes
		bankTransfer := finance.Group("/bank-transfers")
		{
			bankTransfer.POST("/", auth.RequirePermission(rbacSvc, "finance.bank-transfer.create"), bankTransferHandler.CreateBankTransfer)
			bankTransfer.GET("/:id", auth.RequirePermission(rbacSvc, "finance.bank-transfer.read"), bankTransferHandler.GetBankTransferByID)
			bankTransfer.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.bank-transfer.update"), bankTransferHandler.UpdateBankTransfer)
			bankTransfer.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.bank-transfer.delete"), bankTransferHandler.DeleteBankTransfer)
		}

		// Cash Opening Balance routes
		cashOpeningBalance := finance.Group("/cash-opening-balances")
		{
			cashOpeningBalance.POST("/", auth.RequirePermission(rbacSvc, "finance.cash-opening-balance.create"), cashOpeningBalanceHandler.CreateCashOpeningBalance)
			cashOpeningBalance.GET("/", auth.RequirePermission(rbacSvc, "finance.cash-opening-balance.list"), cashOpeningBalanceHandler.GetAllCashOpeningBalances)
			cashOpeningBalance.GET("/:id", auth.RequirePermission(rbacSvc, "finance.cash-opening-balance.read"), cashOpeningBalanceHandler.GetCashOpeningBalanceByID)
			cashOpeningBalance.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.cash-opening-balance.update"), cashOpeningBalanceHandler.UpdateCashOpeningBalance)
			cashOpeningBalance.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.cash-opening-balance.delete"), cashOpeningBalanceHandler.DeleteCashOpeningBalance)
		}

		// Purchase Voucher routes
		purchaseVoucher := finance.Group("/purchase-vouchers")
		{
			purchaseVoucher.POST("/", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.create"), purchaseVoucherHandler.CreatePurchaseVoucher)
			purchaseVoucher.GET("/", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.list"), purchaseVoucherHandler.GetAllPurchaseVouchers)
			purchaseVoucher.GET("/:id", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.read"), purchaseVoucherHandler.GetPurchaseVoucherByID)
			purchaseVoucher.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.update"), purchaseVoucherHandler.UpdatePurchaseVoucher)
			purchaseVoucher.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.delete"), purchaseVoucherHandler.DeletePurchaseVoucher)
			purchaseVoucher.GET("/status/:status", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.list"), purchaseVoucherHandler.GetPurchaseVouchersByStatus)
			purchaseVoucher.POST("/:id/approve", auth.RequirePermission(rbacSvc, "finance.purchase-voucher.approve"), purchaseVoucherHandler.ApprovePurchaseVoucher)
		}

		// Expenditure Request routes
		expenditureRequest := finance.Group("/expenditure-requests")
		{
			expenditureRequest.POST("/", auth.RequirePermission(rbacSvc, "finance.expenditure-request.create"), expenditureRequestHandler.CreateExpenditureRequest)
			expenditureRequest.GET("/", auth.RequirePermission(rbacSvc, "finance.expenditure-request.list"), expenditureRequestHandler.GetAllExpenditureRequests)
			expenditureRequest.GET("/:id", auth.RequirePermission(rbacSvc, "finance.expenditure-request.read"), expenditureRequestHandler.GetExpenditureRequestByID)
			expenditureRequest.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.expenditure-request.update"), expenditureRequestHandler.UpdateExpenditureRequest)
			expenditureRequest.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.expenditure-request.delete"), expenditureRequestHandler.DeleteExpenditureRequest)
			expenditureRequest.GET("/status/:status", auth.RequirePermission(rbacSvc, "finance.expenditure-request.list"), expenditureRequestHandler.GetExpenditureRequestsByStatus)
			expenditureRequest.POST("/:id/approve", auth.RequirePermission(rbacSvc, "finance.expenditure-request.approve"), expenditureRequestHandler.ApproveExpenditureRequest)
			expenditureRequest.POST("/:id/reject", auth.RequirePermission(rbacSvc, "finance.expenditure-request.reject"), expenditureRequestHandler.RejectExpenditureRequest)
			expenditureRequest.POST("/:id/disburse", auth.RequirePermission(rbacSvc, "finance.expenditure-request.disburse"), expenditureRequestHandler.DisburseExpenditureRequest)
		}

		// Check Clearance routes
		checkClearance := finance.Group("/check-clearance")
		{
			checkClearance.POST("/", auth.RequirePermission(rbacSvc, "finance.check-clearance.create"), checkClearanceHandler.CreateCheckClearance)
			checkClearance.GET("/", auth.RequirePermission(rbacSvc, "finance.check-clearance.list"), checkClearanceHandler.GetAllCheckClearances)
			checkClearance.GET("/:id", auth.RequirePermission(rbacSvc, "finance.check-clearance.read"), checkClearanceHandler.GetCheckClearanceByID)
			checkClearance.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.check-clearance.update"), checkClearanceHandler.UpdateCheckClearance)
			checkClearance.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.check-clearance.delete"), checkClearanceHandler.DeleteCheckClearance)
			checkClearance.GET("/status/:status", auth.RequirePermission(rbacSvc, "finance.check-clearance.list"), checkClearanceHandler.GetCheckClearancesByStatus)
			checkClearance.GET("/incoming", auth.RequirePermission(rbacSvc, "finance.check-clearance.list"), checkClearanceHandler.GetIncomingChecks)
			checkClearance.GET("/outgoing", auth.RequirePermission(rbacSvc, "finance.check-clearance.list"), checkClearanceHandler.GetOutgoingChecks)
			checkClearance.POST("/:id/clear", auth.RequirePermission(rbacSvc, "finance.check-clearance.clear"), checkClearanceHandler.ClearCheck)
			checkClearance.POST("/:id/bounce", auth.RequirePermission(rbacSvc, "finance.check-clearance.bounce"), checkClearanceHandler.BounceCheck)
		}

		// Monthly Closing routes
		monthlyClosing := finance.Group("/monthly-closing")
		{
			monthlyClosing.POST("/", auth.RequirePermission(rbacSvc, "finance.monthly-closing.create"), monthlyClosingHandler.CreateMonthlyClosing)
			monthlyClosing.GET("/", auth.RequirePermission(rbacSvc, "finance.monthly-closing.list"), monthlyClosingHandler.GetAllMonthlyClosings)
			monthlyClosing.GET("/:id", auth.RequirePermission(rbacSvc, "finance.monthly-closing.read"), monthlyClosingHandler.GetMonthlyClosingByID)
			monthlyClosing.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.monthly-closing.update"), monthlyClosingHandler.UpdateMonthlyClosing)
			monthlyClosing.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.monthly-closing.delete"), monthlyClosingHandler.DeleteMonthlyClosing)
			monthlyClosing.GET("/period/:month/:year", auth.RequirePermission(rbacSvc, "finance.monthly-closing.read"), monthlyClosingHandler.GetMonthlyClosingByPeriod)
			monthlyClosing.GET("/open", auth.RequirePermission(rbacSvc, "finance.monthly-closing.list"), monthlyClosingHandler.GetOpenPeriods)
			monthlyClosing.POST("/:id/close", auth.RequirePermission(rbacSvc, "finance.monthly-closing.close"), monthlyClosingHandler.CloseMonth)
			monthlyClosing.POST("/:id/lock", auth.RequirePermission(rbacSvc, "finance.monthly-closing.lock"), monthlyClosingHandler.LockClosing)
			monthlyClosing.POST("/:id/unlock", auth.RequirePermission(rbacSvc, "finance.monthly-closing.unlock"), monthlyClosingHandler.UnlockClosing)
		}

		// Cash Book routes
		cashBook := finance.Group("/cash-book")
		{
			cashBook.POST("/", auth.RequirePermission(rbacSvc, "finance.cash-book.create"), cashBookHandler.CreateCashBookEntry)
			cashBook.GET("/", auth.RequirePermission(rbacSvc, "finance.cash-book.list"), cashBookHandler.GetAllCashBookEntries)
			cashBook.GET("/:id", auth.RequirePermission(rbacSvc, "finance.cash-book.read"), cashBookHandler.GetCashBookEntryByID)
			cashBook.PUT("/:id", auth.RequirePermission(rbacSvc, "finance.cash-book.update"), cashBookHandler.UpdateCashBookEntry)
			cashBook.DELETE("/:id", auth.RequirePermission(rbacSvc, "finance.cash-book.delete"), cashBookHandler.DeleteCashBookEntry)
			cashBook.GET("/cash-bank/:cash_bank_id", auth.RequirePermission(rbacSvc, "finance.cash-book.list"), cashBookHandler.GetCashBookEntriesByCashBank)
			cashBook.GET("/type/:type", auth.RequirePermission(rbacSvc, "finance.cash-book.list"), cashBookHandler.GetCashBookEntriesByType)
			cashBook.GET("/balance/:cash_bank_id", auth.RequirePermission(rbacSvc, "finance.cash-book.read"), cashBookHandler.GetCashBalance)
			cashBook.POST("/recalculate/:cash_bank_id", auth.RequirePermission(rbacSvc, "finance.cash-book.update"), cashBookHandler.RecalculateBalances)
		}
	}
}
