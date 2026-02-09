package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/hr/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterHRRoutes registers the HR module's API routes.
func RegisterHRRoutes(router *gin.RouterGroup, employeeHandler *handlers.EmployeeHandler, payrollHandler *handlers.PayrollHandler, attendanceHandler *handlers.AttendanceHandler, leaveHandler *handlers.LeaveHandler, performanceHandler *handlers.PerformanceReviewHandler, trainingHandler *handlers.TrainingHandler, rbacSvc *auth.RBACService) {
	hr := router.Group("/hr")
	hr.Use(auth.RequireModuleAccess(rbacSvc, "hr"))
	{
		// Employee routes
		employees := hr.Group("/employees")
		{
			employees.POST("/", auth.RequirePermission(rbacSvc, "hr.employee.create"), employeeHandler.CreateEmployee)
			employees.GET("/", auth.RequirePermission(rbacSvc, "hr.employee.list"), employeeHandler.GetAllEmployees)
			employees.GET("/by-user/:userId", auth.RequirePermission(rbacSvc, "hr.employee.read"), employeeHandler.GetEmployeeByUserID)
			employees.GET("/:id", auth.RequirePermission(rbacSvc, "hr.employee.read"), employeeHandler.GetEmployeeByID)
			employees.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.employee.update"), employeeHandler.UpdateEmployee)
			employees.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.employee.delete"), employeeHandler.DeleteEmployee)
		}

		// Payroll routes
		payroll := hr.Group("/payroll")
		{
			// Payroll periods
			periods := payroll.Group("/periods")
			{
				periods.GET("/", auth.RequirePermission(rbacSvc, "hr.payroll.list"), payrollHandler.GetPayrollPeriods)
				periods.POST("/", auth.RequirePermission(rbacSvc, "hr.payroll.create"), payrollHandler.CreatePayrollPeriod)
				periods.GET("/:id", auth.RequirePermission(rbacSvc, "hr.payroll.read"), payrollHandler.GetPayrollPeriodByID)
				periods.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.payroll.update"), payrollHandler.UpdatePayrollPeriod)
				periods.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.payroll.delete"), payrollHandler.DeletePayrollPeriod)
			}

			// Salary calculations
			calculations := payroll.Group("/calculations")
			{
				calculations.GET("/", auth.RequirePermission(rbacSvc, "hr.payroll.list"), payrollHandler.GetSalaryCalculations)
				calculations.GET("/:id", auth.RequirePermission(rbacSvc, "hr.payroll.read"), payrollHandler.GetSalaryCalculationByID)
			}

			// Payroll processing
			payroll.POST("/process", auth.RequirePermission(rbacSvc, "hr.payroll.process"), payrollHandler.ProcessPayroll)
			payroll.POST("/approve/:id", auth.RequirePermission(rbacSvc, "hr.payroll.approve"), payrollHandler.ApprovePayroll)

			// Frontend compatibility endpoints
			payroll.GET("/items", auth.RequirePermission(rbacSvc, "hr.payroll.list"), payrollHandler.GetPayrollItems)
		}

		// Attendance routes
		attendance := hr.Group("/attendance")
		{
			attendance.GET("/", auth.RequirePermission(rbacSvc, "hr.employee.list"), attendanceHandler.GetAttendanceRecords)
			attendance.GET("/employee/:id", auth.RequirePermission(rbacSvc, "hr.employee.read"), attendanceHandler.GetAttendanceByEmployee)
			attendance.POST("/", auth.RequirePermission(rbacSvc, "hr.employee.create"), attendanceHandler.CreateAttendanceRecord)
			attendance.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.employee.update"), attendanceHandler.UpdateAttendanceRecord)
		}

		// Leave management routes
		leave := hr.Group("/leave")
		{
			// Leave types
			leaveTypes := leave.Group("/types")
			{
				leaveTypes.POST("/", auth.RequirePermission(rbacSvc, "hr.leave.create"), leaveHandler.CreateLeaveType)
				leaveTypes.GET("/", auth.RequirePermission(rbacSvc, "hr.leave.list"), leaveHandler.GetAllLeaveTypes)
				leaveTypes.GET("/:id", auth.RequirePermission(rbacSvc, "hr.leave.read"), leaveHandler.GetLeaveTypeByID)
				leaveTypes.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.leave.update"), leaveHandler.UpdateLeaveType)
				leaveTypes.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.leave.delete"), leaveHandler.DeleteLeaveType)
			}

			// Leave requests
			requests := leave.Group("/requests")
			{
				requests.POST("/", auth.RequirePermission(rbacSvc, "hr.leave.create"), leaveHandler.CreateLeaveRequest)
				requests.GET("/", auth.RequirePermission(rbacSvc, "hr.leave.list"), leaveHandler.GetAllLeaveRequests)
				requests.GET("/:id", auth.RequirePermission(rbacSvc, "hr.leave.read"), leaveHandler.GetLeaveRequestByID)
				requests.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.leave.update"), leaveHandler.UpdateLeaveRequest)
				requests.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.leave.delete"), leaveHandler.DeleteLeaveRequest)

				// Leave request actions
				requests.POST("/:id/approve", auth.RequirePermission(rbacSvc, "hr.leave.approve"), leaveHandler.ApproveLeaveRequest)
				requests.POST("/:id/reject", auth.RequirePermission(rbacSvc, "hr.leave.reject"), leaveHandler.RejectLeaveRequest)
				requests.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "hr.leave.cancel"), leaveHandler.CancelLeaveRequest)
			}

			// Leave balances
			balances := leave.Group("/balances")
			{
				balances.GET("/employee/:employee_id", auth.RequirePermission(rbacSvc, "hr.leave.read"), leaveHandler.GetLeaveBalancesByEmployee)
			}

			// Leave statistics
			leave.GET("/statistics", auth.RequirePermission(rbacSvc, "hr.leave.list"), leaveHandler.GetLeaveStatistics)
		}

		// Performance Review routes
		performance := hr.Group("/performance")
		{
			// Performance reviews
			reviews := performance.Group("/reviews")
			{
				reviews.GET("/", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetAllPerformanceReviews)
				reviews.POST("/", auth.RequirePermission(rbacSvc, "hr.performance.create"), performanceHandler.CreatePerformanceReview)
				reviews.GET("/:id", auth.RequirePermission(rbacSvc, "hr.performance.read"), performanceHandler.GetPerformanceReviewByID)
				reviews.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.performance.update"), performanceHandler.UpdatePerformanceReview)
				reviews.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.performance.delete"), performanceHandler.DeletePerformanceReview)

				// Performance reviews by employee, period, status
				reviews.GET("/employee/:employeeId", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetPerformanceReviewsByEmployee)
				reviews.GET("/period/:period", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetPerformanceReviewsByPeriod)
				reviews.GET("/status/:status", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetPerformanceReviewsByStatus)
			}

			// Performance statistics
			performance.GET("/statistics", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetPerformanceStatistics)

			// Supporting data
			performance.GET("/cycles", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetReviewCycles)
			performance.GET("/goals", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetPerformanceGoals)
			performance.GET("/competencies", auth.RequirePermission(rbacSvc, "hr.performance.list"), performanceHandler.GetCompetencies)
		}

		// Training Management routes
		training := hr.Group("/training")
		{
			// Training programs
			programs := training.Group("/programs")
			{
				programs.POST("/", auth.RequirePermission(rbacSvc, "hr.training.create"), trainingHandler.CreateProgram)
				programs.GET("/", auth.RequirePermission(rbacSvc, "hr.training.list"), trainingHandler.GetAllPrograms)
				programs.GET("/:id", auth.RequirePermission(rbacSvc, "hr.training.read"), trainingHandler.GetProgramByID)
				programs.PUT("/:id", auth.RequirePermission(rbacSvc, "hr.training.update"), trainingHandler.UpdateProgram)
				programs.DELETE("/:id", auth.RequirePermission(rbacSvc, "hr.training.delete"), trainingHandler.DeleteProgram)
			}

			// Training enrollments
			enrollments := training.Group("/enrollments")
			{
				enrollments.POST("/", auth.RequirePermission(rbacSvc, "hr.training.create"), trainingHandler.EnrollEmployee)
				enrollments.GET("/", auth.RequirePermission(rbacSvc, "hr.training.list"), trainingHandler.GetAllEnrollments)
				enrollments.PUT("/:id/progress", auth.RequirePermission(rbacSvc, "hr.training.update"), trainingHandler.UpdateProgress)
				enrollments.POST("/:id/complete", auth.RequirePermission(rbacSvc, "hr.training.update"), trainingHandler.CompleteTraining)
			}

			// Training statistics
			training.GET("/statistics", auth.RequirePermission(rbacSvc, "hr.training.list"), trainingHandler.GetStatistics)
		}
	}
}
