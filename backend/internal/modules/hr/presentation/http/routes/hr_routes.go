package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/hr/presentation/http/handlers"
)

// RegisterHRRoutes registers the HR module's API routes.
func RegisterHRRoutes(router *gin.RouterGroup, employeeHandler *handlers.EmployeeHandler, payrollHandler *handlers.PayrollHandler, attendanceHandler *handlers.AttendanceHandler, leaveHandler *handlers.LeaveHandler, performanceHandler *handlers.PerformanceReviewHandler) {
	hr := router.Group("/hr")
	{
		// Employee routes
		employees := hr.Group("/employees")
		{
			employees.POST("/", employeeHandler.CreateEmployee)
			employees.GET("/", employeeHandler.GetAllEmployees)
			employees.GET("/:id", employeeHandler.GetEmployeeByID)
			employees.PUT("/:id", employeeHandler.UpdateEmployee)
			employees.DELETE("/:id", employeeHandler.DeleteEmployee)
		}

		// Payroll routes
		payroll := hr.Group("/payroll")
		{
			// Payroll periods
			periods := payroll.Group("/periods")
			{
				periods.GET("/", payrollHandler.GetPayrollPeriods)
				periods.POST("/", payrollHandler.CreatePayrollPeriod)
				periods.GET("/:id", payrollHandler.GetPayrollPeriodByID)
				periods.PUT("/:id", payrollHandler.UpdatePayrollPeriod)
				periods.DELETE("/:id", payrollHandler.DeletePayrollPeriod)
			}

			// Salary calculations
			calculations := payroll.Group("/calculations")
			{
				calculations.GET("/", payrollHandler.GetSalaryCalculations)
				calculations.GET("/:id", payrollHandler.GetSalaryCalculationByID)
			}

			// Payroll processing
			payroll.POST("/process", payrollHandler.ProcessPayroll)
			payroll.POST("/approve/:id", payrollHandler.ApprovePayroll)

			// Frontend compatibility endpoints
			payroll.GET("/items", payrollHandler.GetPayrollItems)
		}

		// Attendance routes
		attendance := hr.Group("/attendance")
		{
			attendance.GET("/", attendanceHandler.GetAttendanceRecords)
			attendance.GET("/employee/:id", attendanceHandler.GetAttendanceByEmployee)
			attendance.POST("/", attendanceHandler.CreateAttendanceRecord)
			attendance.PUT("/:id", attendanceHandler.UpdateAttendanceRecord)
		}

		// Leave management routes
		leave := hr.Group("/leave")
		{
			// Leave types
			leaveTypes := leave.Group("/types")
			{
				leaveTypes.POST("/", leaveHandler.CreateLeaveType)
				leaveTypes.GET("/", leaveHandler.GetAllLeaveTypes)
				leaveTypes.GET("/:id", leaveHandler.GetLeaveTypeByID)
				leaveTypes.PUT("/:id", leaveHandler.UpdateLeaveType)
				leaveTypes.DELETE("/:id", leaveHandler.DeleteLeaveType)
			}

			// Leave requests
			requests := leave.Group("/requests")
			{
				requests.POST("/", leaveHandler.CreateLeaveRequest)
				requests.GET("/", leaveHandler.GetAllLeaveRequests)
				requests.GET("/:id", leaveHandler.GetLeaveRequestByID)
				requests.PUT("/:id", leaveHandler.UpdateLeaveRequest)
				requests.DELETE("/:id", leaveHandler.DeleteLeaveRequest)

				// Leave request actions
				requests.POST("/:id/approve", leaveHandler.ApproveLeaveRequest)
				requests.POST("/:id/reject", leaveHandler.RejectLeaveRequest)
				requests.POST("/:id/cancel", leaveHandler.CancelLeaveRequest)
			}

			// Leave balances
			balances := leave.Group("/balances")
			{
				balances.GET("/employee/:employee_id", leaveHandler.GetLeaveBalancesByEmployee)
			}

			// Leave statistics
			leave.GET("/statistics", leaveHandler.GetLeaveStatistics)
		}

		// Performance Review routes
		performance := hr.Group("/performance")
		{
			// Performance reviews
			reviews := performance.Group("/reviews")
			{
				reviews.GET("/", performanceHandler.GetAllPerformanceReviews)
				reviews.POST("/", performanceHandler.CreatePerformanceReview)
				reviews.GET("/:id", performanceHandler.GetPerformanceReviewByID)
				reviews.PUT("/:id", performanceHandler.UpdatePerformanceReview)
				reviews.DELETE("/:id", performanceHandler.DeletePerformanceReview)

				// Performance reviews by employee, period, status
				reviews.GET("/employee/:employeeId", performanceHandler.GetPerformanceReviewsByEmployee)
				reviews.GET("/period/:period", performanceHandler.GetPerformanceReviewsByPeriod)
				reviews.GET("/status/:status", performanceHandler.GetPerformanceReviewsByStatus)
			}

			// Performance statistics
			performance.GET("/statistics", performanceHandler.GetPerformanceStatistics)

			// Supporting data
			performance.GET("/cycles", performanceHandler.GetReviewCycles)
			performance.GET("/goals", performanceHandler.GetPerformanceGoals)
			performance.GET("/competencies", performanceHandler.GetCompetencies)
		}
	}
}
