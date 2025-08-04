package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/presentation/http/handlers"
)

// RegisterFinanceRoutes registers the finance routes.
func RegisterFinanceRoutes(router *gin.RouterGroup, cashBankHandler *handlers.CashBankHandler, paymentHandler *handlers.PaymentHandler, invoiceHandler *handlers.InvoiceHandler, accountsPayableHandler *handlers.AccountsPayableHandler, accountsReceivableHandler *handlers.AccountsReceivableHandler, cashDisbursementHandler *handlers.CashDisbursementHandler, cashReceiptHandler *handlers.CashReceiptHandler, bankTransferHandler *handlers.BankTransferHandler, cashOpeningBalanceHandler *handlers.CashOpeningBalanceHandler, purchaseVoucherHandler *handlers.PurchaseVoucherHandler, expenditureRequestHandler *handlers.ExpenditureRequestHandler, checkClearanceHandler *handlers.CheckClearanceHandler, monthlyClosingHandler *handlers.MonthlyClosingHandler, cashBookHandler *handlers.CashBookHandler) {
	finance := router.Group("/finance")
	{
		// Cash/Bank routes
		cashBank := finance.Group("/cash-banks")
		{
			cashBank.POST("/", cashBankHandler.CreateCashBank)
			cashBank.GET("/:id", cashBankHandler.GetCashBankByID)
			cashBank.PUT("/:id", cashBankHandler.UpdateCashBank)
			cashBank.DELETE("/:id", cashBankHandler.DeleteCashBank)
		}

		// Payment routes
		payment := finance.Group("/payments")
		{
			payment.POST("/", paymentHandler.CreatePayment)
			payment.GET("/:id", paymentHandler.GetPaymentByID)
			payment.PUT("/:id", paymentHandler.UpdatePayment)
			payment.DELETE("/:id", paymentHandler.DeletePayment)
		}

		// Invoice routes
		invoice := finance.Group("/invoices")
		{
			invoice.POST("/", invoiceHandler.CreateInvoice)
			invoice.GET("/:id", invoiceHandler.GetInvoiceByID)
			invoice.PUT("/:id", invoiceHandler.UpdateInvoice)
			invoice.DELETE("/:id", invoiceHandler.DeleteInvoice)
		}

		// Accounts Payable routes
		accountsPayable := finance.Group("/accounts-payable")
		{
			accountsPayable.POST("/", accountsPayableHandler.CreateAccountsPayable)
			accountsPayable.GET("/:id", accountsPayableHandler.GetAccountsPayableByID)
			accountsPayable.PUT("/:id", accountsPayableHandler.UpdateAccountsPayable)
			accountsPayable.DELETE("/:id", accountsPayableHandler.DeleteAccountsPayable)
		}

		// Accounts Receivable routes
		accountsReceivable := finance.Group("/accounts-receivable")
		{
			accountsReceivable.POST("/", accountsReceivableHandler.CreateAccountsReceivable)
			accountsReceivable.GET("/:id", accountsReceivableHandler.GetAccountsReceivableByID)
			accountsReceivable.PUT("/:id", accountsReceivableHandler.UpdateAccountsReceivable)
			accountsReceivable.DELETE("/:id", accountsReceivableHandler.DeleteAccountsReceivable)
		}

		// Cash Disbursement routes
		cashDisbursement := finance.Group("/cash-disbursements")
		{
			cashDisbursement.POST("/", cashDisbursementHandler.CreateCashDisbursement)
			cashDisbursement.GET("/:id", cashDisbursementHandler.GetCashDisbursementByID)
			cashDisbursement.PUT("/:id", cashDisbursementHandler.UpdateCashDisbursement)
			cashDisbursement.DELETE("/:id", cashDisbursementHandler.DeleteCashDisbursement)
		}

		// Cash Receipt routes
		cashReceipt := finance.Group("/cash-receipts")
		{
			cashReceipt.POST("/", cashReceiptHandler.CreateCashReceipt)
			cashReceipt.GET("/:id", cashReceiptHandler.GetCashReceiptByID)
			cashReceipt.PUT("/:id", cashReceiptHandler.UpdateCashReceipt)
			cashReceipt.DELETE("/:id", cashReceiptHandler.DeleteCashReceipt)
		}

		// Bank Transfer routes
		bankTransfer := finance.Group("/bank-transfers")
		{
			bankTransfer.POST("/", bankTransferHandler.CreateBankTransfer)
			bankTransfer.GET("/:id", bankTransferHandler.GetBankTransferByID)
			bankTransfer.PUT("/:id", bankTransferHandler.UpdateBankTransfer)
			bankTransfer.DELETE("/:id", bankTransferHandler.DeleteBankTransfer)
		}

		// Cash Opening Balance routes
		cashOpeningBalance := finance.Group("/cash-opening-balances")
		{
			cashOpeningBalance.POST("/", cashOpeningBalanceHandler.CreateCashOpeningBalance)
			cashOpeningBalance.GET("/", cashOpeningBalanceHandler.GetAllCashOpeningBalances)
			cashOpeningBalance.GET("/:id", cashOpeningBalanceHandler.GetCashOpeningBalanceByID)
			cashOpeningBalance.PUT("/:id", cashOpeningBalanceHandler.UpdateCashOpeningBalance)
			cashOpeningBalance.DELETE("/:id", cashOpeningBalanceHandler.DeleteCashOpeningBalance)
		}

		// Purchase Voucher routes
		purchaseVoucher := finance.Group("/purchase-vouchers")
		{
			purchaseVoucher.POST("/", purchaseVoucherHandler.CreatePurchaseVoucher)
			purchaseVoucher.GET("/", purchaseVoucherHandler.GetAllPurchaseVouchers)
			purchaseVoucher.GET("/:id", purchaseVoucherHandler.GetPurchaseVoucherByID)
			purchaseVoucher.PUT("/:id", purchaseVoucherHandler.UpdatePurchaseVoucher)
			purchaseVoucher.DELETE("/:id", purchaseVoucherHandler.DeletePurchaseVoucher)
			purchaseVoucher.GET("/status/:status", purchaseVoucherHandler.GetPurchaseVouchersByStatus)
			purchaseVoucher.POST("/:id/approve", purchaseVoucherHandler.ApprovePurchaseVoucher)
		}

		// Expenditure Request routes
		expenditureRequest := finance.Group("/expenditure-requests")
		{
			expenditureRequest.POST("/", expenditureRequestHandler.CreateExpenditureRequest)
			expenditureRequest.GET("/", expenditureRequestHandler.GetAllExpenditureRequests)
			expenditureRequest.GET("/:id", expenditureRequestHandler.GetExpenditureRequestByID)
			expenditureRequest.PUT("/:id", expenditureRequestHandler.UpdateExpenditureRequest)
			expenditureRequest.DELETE("/:id", expenditureRequestHandler.DeleteExpenditureRequest)
			expenditureRequest.GET("/status/:status", expenditureRequestHandler.GetExpenditureRequestsByStatus)
			expenditureRequest.POST("/:id/approve", expenditureRequestHandler.ApproveExpenditureRequest)
			expenditureRequest.POST("/:id/reject", expenditureRequestHandler.RejectExpenditureRequest)
			expenditureRequest.POST("/:id/disburse", expenditureRequestHandler.DisburseExpenditureRequest)
		}

		// Check Clearance routes
		checkClearance := finance.Group("/check-clearance")
		{
			checkClearance.POST("/", checkClearanceHandler.CreateCheckClearance)
			checkClearance.GET("/", checkClearanceHandler.GetAllCheckClearances)
			checkClearance.GET("/:id", checkClearanceHandler.GetCheckClearanceByID)
			checkClearance.PUT("/:id", checkClearanceHandler.UpdateCheckClearance)
			checkClearance.DELETE("/:id", checkClearanceHandler.DeleteCheckClearance)
			checkClearance.GET("/status/:status", checkClearanceHandler.GetCheckClearancesByStatus)
			checkClearance.GET("/incoming", checkClearanceHandler.GetIncomingChecks)
			checkClearance.GET("/outgoing", checkClearanceHandler.GetOutgoingChecks)
			checkClearance.POST("/:id/clear", checkClearanceHandler.ClearCheck)
			checkClearance.POST("/:id/bounce", checkClearanceHandler.BounceCheck)
		}

		// Monthly Closing routes
		monthlyClosing := finance.Group("/monthly-closing")
		{
			monthlyClosing.POST("/", monthlyClosingHandler.CreateMonthlyClosing)
			monthlyClosing.GET("/", monthlyClosingHandler.GetAllMonthlyClosings)
			monthlyClosing.GET("/:id", monthlyClosingHandler.GetMonthlyClosingByID)
			monthlyClosing.PUT("/:id", monthlyClosingHandler.UpdateMonthlyClosing)
			monthlyClosing.DELETE("/:id", monthlyClosingHandler.DeleteMonthlyClosing)
			monthlyClosing.GET("/period/:month/:year", monthlyClosingHandler.GetMonthlyClosingByPeriod)
			monthlyClosing.GET("/open", monthlyClosingHandler.GetOpenPeriods)
			monthlyClosing.POST("/:id/close", monthlyClosingHandler.CloseMonth)
			monthlyClosing.POST("/:id/lock", monthlyClosingHandler.LockClosing)
			monthlyClosing.POST("/:id/unlock", monthlyClosingHandler.UnlockClosing)
		}

		// Cash Book routes
		cashBook := finance.Group("/cash-book")
		{
			cashBook.POST("/", cashBookHandler.CreateCashBookEntry)
			cashBook.GET("/", cashBookHandler.GetAllCashBookEntries)
			cashBook.GET("/:id", cashBookHandler.GetCashBookEntryByID)
			cashBook.PUT("/:id", cashBookHandler.UpdateCashBookEntry)
			cashBook.DELETE("/:id", cashBookHandler.DeleteCashBookEntry)
			cashBook.GET("/cash-bank/:cash_bank_id", cashBookHandler.GetCashBookEntriesByCashBank)
			cashBook.GET("/type/:type", cashBookHandler.GetCashBookEntriesByType)
			cashBook.GET("/balance/:cash_bank_id", cashBookHandler.GetCashBalance)
			cashBook.POST("/recalculate/:cash_bank_id", cashBookHandler.RecalculateBalances)
		}
	}
}