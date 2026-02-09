package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/domain/services"
	"malaka/internal/shared/response"
)

type ProductionDashboardHandler struct {
	workOrderService services.WorkOrderService
	planService      services.ProductionPlanService
	qcService        services.QualityControlService
}

func NewProductionDashboardHandler(
	workOrderService services.WorkOrderService,
	planService services.ProductionPlanService,
	qcService services.QualityControlService,
) *ProductionDashboardHandler {
	return &ProductionDashboardHandler{
		workOrderService: workOrderService,
		planService:      planService,
		qcService:        qcService,
	}
}

// ProductionSummaryResponse represents the production summary
type ProductionSummaryResponse struct {
	TotalWorkOrders     int     `json:"total_work_orders"`
	ActiveWorkOrders    int     `json:"active_work_orders"`
	CompletedWorkOrders int     `json:"completed_work_orders"`
	DelayedWorkOrders   int     `json:"delayed_work_orders"`
	TotalProduction     int     `json:"total_production"`
	AverageEfficiency   float64 `json:"average_efficiency"`
	QualityScore        float64 `json:"quality_score"`
	OnTimeDelivery      float64 `json:"on_time_delivery"`
}

// MaterialCostBreakdown represents material cost breakdown
type MaterialCostBreakdown struct {
	RawMaterials float64 `json:"raw_materials"`
	Components   float64 `json:"components"`
	Consumables  float64 `json:"consumables"`
}

// LaborCost represents labor cost details
type LaborCost struct {
	Total      float64 `json:"total"`
	PerUnit    float64 `json:"per_unit"`
	HoursUsed  float64 `json:"hours_used"`
	HourlyRate float64 `json:"hourly_rate"`
}

// OverheadCostBreakdown represents overhead cost breakdown
type OverheadCostBreakdown struct {
	Factory      float64 `json:"factory"`
	Utilities    float64 `json:"utilities"`
	Depreciation float64 `json:"depreciation"`
	Other        float64 `json:"other"`
}

// LogisticsCostBreakdown represents logistics cost breakdown
type LogisticsCostBreakdown struct {
	Inbound  float64 `json:"inbound"`
	Outbound float64 `json:"outbound"`
	Storage  float64 `json:"storage"`
	Handling float64 `json:"handling"`
}

// MaterialCost represents material cost with breakdown
type MaterialCost struct {
	Total     float64               `json:"total"`
	PerUnit   float64               `json:"per_unit"`
	Breakdown MaterialCostBreakdown `json:"breakdown"`
}

// OverheadCost represents overhead cost with breakdown
type OverheadCost struct {
	Total     float64               `json:"total"`
	PerUnit   float64               `json:"per_unit"`
	Breakdown OverheadCostBreakdown `json:"breakdown"`
}

// LogisticsCost represents logistics cost with breakdown
type LogisticsCost struct {
	Total     float64                `json:"total"`
	PerUnit   float64                `json:"per_unit"`
	Breakdown LogisticsCostBreakdown `json:"breakdown"`
}

// ProductionCostAnalysis represents cost analysis for a product
type ProductionCostAnalysis struct {
	ID            string        `json:"id"`
	ProductID     string        `json:"product_id"`
	ProductCode   string        `json:"product_code"`
	ProductName   string        `json:"product_name"`
	UnitsProduced int           `json:"units_produced"`
	MaterialCost  MaterialCost  `json:"material_cost"`
	LaborCost     LaborCost     `json:"labor_cost"`
	OverheadCost  OverheadCost  `json:"overhead_cost"`
	LogisticsCost LogisticsCost `json:"logistics_cost"`
	TotalCost     float64       `json:"total_cost"`
	CostPerUnit   float64       `json:"cost_per_unit"`
	Revenue       float64       `json:"revenue"`
	Profit        float64       `json:"profit"`
	ProfitMargin  float64       `json:"profit_margin"`
	PeriodStart   string        `json:"period_start"`
	PeriodEnd     string        `json:"period_end"`
}

// TimeEfficiency represents time efficiency metrics
type TimeEfficiency struct {
	PlannedHours float64 `json:"planned_hours"`
	ActualHours  float64 `json:"actual_hours"`
	Efficiency   float64 `json:"efficiency"`
}

// MaterialEfficiency represents material efficiency metrics
type MaterialEfficiency struct {
	MaterialsPlanned int     `json:"materials_planned"`
	MaterialsUsed    int     `json:"materials_used"`
	Waste            int     `json:"waste"`
	Efficiency       float64 `json:"efficiency"`
}

// ProductionEfficiencyMetrics represents efficiency metrics for a product
type ProductionEfficiencyMetrics struct {
	ID                 string             `json:"id"`
	ProductID          string             `json:"product_id"`
	ProductCode        string             `json:"product_code"`
	ProductName        string             `json:"product_name"`
	OverallEfficiency  float64            `json:"overall_efficiency"`
	TimeEfficiency     TimeEfficiency     `json:"time_efficiency"`
	MaterialEfficiency MaterialEfficiency `json:"material_efficiency"`
	QualityScore       float64            `json:"quality_score"`
	DefectRate         float64            `json:"defect_rate"`
	ReworkRate         float64            `json:"rework_rate"`
	ThroughputRate     float64            `json:"throughput_rate"`
	CycleTime          float64            `json:"cycle_time"`
	SetupTime          float64            `json:"setup_time"`
	Downtime           float64            `json:"downtime"`
	PeriodStart        string             `json:"period_start"`
	PeriodEnd          string             `json:"period_end"`
}

// ProductionAnalyticsResponse represents the full analytics response
type ProductionAnalyticsResponse struct {
	CostAnalysis      []ProductionCostAnalysis      `json:"cost_analysis"`
	EfficiencyMetrics []ProductionEfficiencyMetrics `json:"efficiency_metrics"`
}

// GetSummary handles GET /api/v1/production/summary
func (h *ProductionDashboardHandler) GetSummary(c *gin.Context) {
	ctx := c.Request.Context()

	// Get work order statistics
	workOrders, _, err := h.workOrderService.GetAllWorkOrders(ctx, 1000, 0, "", "")
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve work orders", err.Error())
		return
	}

	var totalWorkOrders, activeWorkOrders, completedWorkOrders, delayedWorkOrders int
	var totalProduction int
	var totalEfficiency float64
	var efficiencyCount int

	for _, wo := range workOrders {
		totalWorkOrders++
		totalProduction += wo.Quantity

		switch wo.Status {
		case "in_progress":
			activeWorkOrders++
		case "completed":
			completedWorkOrders++
		case "delayed":
			delayedWorkOrders++
		}

		if wo.Efficiency != nil && *wo.Efficiency > 0 {
			totalEfficiency += *wo.Efficiency
			efficiencyCount++
		}
	}

	averageEfficiency := 0.0
	if efficiencyCount > 0 {
		averageEfficiency = totalEfficiency / float64(efficiencyCount)
	}

	// Get quality score from QC records
	qualityScore := 95.0 // Default if no QC data
	qcRecords, _, err := h.qcService.GetAllQualityControls(ctx, 1000, 0, "", "", "")
	if err == nil && len(qcRecords) > 0 {
		var totalScore float64
		var scoreCount int
		for _, qc := range qcRecords {
			if qc.OverallScore > 0 {
				totalScore += qc.OverallScore
				scoreCount++
			}
		}
		if scoreCount > 0 {
			qualityScore = totalScore / float64(scoreCount)
		}
	}

	// Calculate on-time delivery (completed on or before planned end date)
	onTimeCount := 0
	deliveredCount := 0
	for _, wo := range workOrders {
		if wo.Status == "completed" && wo.ActualEndDate != nil {
			deliveredCount++
			if !wo.ActualEndDate.After(wo.PlannedEndDate) {
				onTimeCount++
			}
		}
	}

	onTimeDelivery := 0.0
	if deliveredCount > 0 {
		onTimeDelivery = float64(onTimeCount) / float64(deliveredCount) * 100
	}

	summary := ProductionSummaryResponse{
		TotalWorkOrders:     totalWorkOrders,
		ActiveWorkOrders:    activeWorkOrders,
		CompletedWorkOrders: completedWorkOrders,
		DelayedWorkOrders:   delayedWorkOrders,
		TotalProduction:     totalProduction,
		AverageEfficiency:   averageEfficiency,
		QualityScore:        qualityScore,
		OnTimeDelivery:      onTimeDelivery,
	}

	response.OK(c, "Production summary retrieved successfully", summary)
}

// GetAnalytics handles GET /api/v1/production/analytics
func (h *ProductionDashboardHandler) GetAnalytics(c *gin.Context) {
	ctx := c.Request.Context()

	// Get work orders for analytics
	workOrders, _, err := h.workOrderService.GetAllWorkOrders(ctx, 100, 0, "", "")
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve work orders", err.Error())
		return
	}

	// Build cost analysis and efficiency metrics from work orders
	costAnalysis := make([]ProductionCostAnalysis, 0)
	efficiencyMetrics := make([]ProductionEfficiencyMetrics, 0)

	// Group by product
	productMap := make(map[string]bool)
	for _, wo := range workOrders {
		if wo.Status == "completed" || wo.Status == "in_progress" {
			productMap[wo.ProductID.String()] = true
		}
	}

	idx := 1
	for productID := range productMap {
		// Get first order for product info
		var firstOrder *struct {
			ProductCode      string
			ProductName      string
			PlannedStartDate string
			PlannedEndDate   string
			Efficiency       float64
			QualityScore     float64
		}

		// Calculate aggregated costs
		var totalUnits int
		var totalActualCost float64
		var totalPlannedHours, totalActualHours float64

		for _, wo := range workOrders {
			if wo.ProductID.String() == productID {
				if firstOrder == nil {
					efficiency := 0.0
					qualityScoreVal := 0.0
					if wo.Efficiency != nil {
						efficiency = *wo.Efficiency
					}
					if wo.QualityScore != nil {
						qualityScoreVal = *wo.QualityScore
					}
					firstOrder = &struct {
						ProductCode      string
						ProductName      string
						PlannedStartDate string
						PlannedEndDate   string
						Efficiency       float64
						QualityScore     float64
					}{
						ProductCode:      wo.ProductCode,
						ProductName:      wo.ProductName,
						PlannedStartDate: wo.PlannedStartDate.Format("2006-01-02"),
						PlannedEndDate:   wo.PlannedEndDate.Format("2006-01-02"),
						Efficiency:       efficiency,
						QualityScore:     qualityScoreVal,
					}
				}

				if wo.Status == "completed" {
					totalUnits += wo.Quantity
				}
				totalActualCost += wo.ActualCost

				// Sum up operation hours
				for _, op := range wo.Operations {
					totalPlannedHours += float64(op.PlannedDuration)
					if op.ActualDuration != nil {
						totalActualHours += float64(*op.ActualDuration)
					}
				}
			}
		}

		if firstOrder == nil {
			continue
		}

		if totalUnits == 0 {
			totalUnits = 1 // Avoid division by zero
		}

		// Create cost analysis entry
		costPerUnit := totalActualCost / float64(totalUnits)
		revenue := costPerUnit * 1.3 * float64(totalUnits) // 30% markup estimate
		profit := revenue - totalActualCost
		profitMargin := 0.0
		if revenue > 0 {
			profitMargin = (profit / revenue) * 100
		}

		costAnalysis = append(costAnalysis, ProductionCostAnalysis{
			ID:            fmt.Sprintf("%d", idx),
			ProductID:     productID,
			ProductCode:   firstOrder.ProductCode,
			ProductName:   firstOrder.ProductName,
			UnitsProduced: totalUnits,
			MaterialCost: MaterialCost{
				Total:   totalActualCost * 0.55, // Estimate 55% material
				PerUnit: costPerUnit * 0.55,
				Breakdown: MaterialCostBreakdown{
					RawMaterials: totalActualCost * 0.35,
					Components:   totalActualCost * 0.15,
					Consumables:  totalActualCost * 0.05,
				},
			},
			LaborCost: LaborCost{
				Total:      totalActualCost * 0.25,
				PerUnit:    costPerUnit * 0.25,
				HoursUsed:  totalActualHours,
				HourlyRate: 30000, // Default hourly rate
			},
			OverheadCost: OverheadCost{
				Total:   totalActualCost * 0.15,
				PerUnit: costPerUnit * 0.15,
				Breakdown: OverheadCostBreakdown{
					Factory:      totalActualCost * 0.06,
					Utilities:    totalActualCost * 0.03,
					Depreciation: totalActualCost * 0.04,
					Other:        totalActualCost * 0.02,
				},
			},
			LogisticsCost: LogisticsCost{
				Total:   totalActualCost * 0.05,
				PerUnit: costPerUnit * 0.05,
				Breakdown: LogisticsCostBreakdown{
					Inbound:  totalActualCost * 0.02,
					Outbound: totalActualCost * 0.015,
					Storage:  totalActualCost * 0.01,
					Handling: totalActualCost * 0.005,
				},
			},
			TotalCost:    totalActualCost,
			CostPerUnit:  costPerUnit,
			Revenue:      revenue,
			Profit:       profit,
			ProfitMargin: profitMargin,
			PeriodStart:  firstOrder.PlannedStartDate,
			PeriodEnd:    firstOrder.PlannedEndDate,
		})

		// Create efficiency metrics entry
		timeEfficiency := 0.0
		if totalActualHours > 0 {
			timeEfficiency = (totalPlannedHours / totalActualHours) * 100
		}

		throughputRate := 0.0
		cycleTime := 0.0
		if totalActualHours > 0 {
			throughputRate = float64(totalUnits) / totalActualHours
			cycleTime = totalActualHours / float64(totalUnits) * 60 // in minutes
		}

		efficiencyMetrics = append(efficiencyMetrics, ProductionEfficiencyMetrics{
			ID:                fmt.Sprintf("%d", idx),
			ProductID:         productID,
			ProductCode:       firstOrder.ProductCode,
			ProductName:       firstOrder.ProductName,
			OverallEfficiency: firstOrder.Efficiency,
			TimeEfficiency: TimeEfficiency{
				PlannedHours: totalPlannedHours,
				ActualHours:  totalActualHours,
				Efficiency:   timeEfficiency,
			},
			MaterialEfficiency: MaterialEfficiency{
				MaterialsPlanned: totalUnits,
				MaterialsUsed:    int(float64(totalUnits) * 1.03), // 3% waste estimate
				Waste:            int(float64(totalUnits) * 0.03),
				Efficiency:       97.0,
			},
			QualityScore:   firstOrder.QualityScore,
			DefectRate:     3.0, // Default estimate
			ReworkRate:     1.5,
			ThroughputRate: throughputRate,
			CycleTime:      cycleTime,
			SetupTime:      30,                       // Default estimate
			Downtime:       totalActualHours * 0.05, // 5% downtime estimate
			PeriodStart:    firstOrder.PlannedStartDate,
			PeriodEnd:      firstOrder.PlannedEndDate,
		})

		idx++
	}

	analytics := ProductionAnalyticsResponse{
		CostAnalysis:      costAnalysis,
		EfficiencyMetrics: efficiencyMetrics,
	}

	response.OK(c, "Production analytics retrieved successfully", analytics)
}
