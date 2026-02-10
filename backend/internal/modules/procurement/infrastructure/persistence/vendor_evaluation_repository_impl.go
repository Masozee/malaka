package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
)

// VendorEvaluationRepositoryImpl implements repositories.VendorEvaluationRepository.
type VendorEvaluationRepositoryImpl struct {
	db *sqlx.DB
}

// NewVendorEvaluationRepositoryImpl creates a new VendorEvaluationRepositoryImpl.
func NewVendorEvaluationRepositoryImpl(db *sqlx.DB) *VendorEvaluationRepositoryImpl {
	return &VendorEvaluationRepositoryImpl{db: db}
}

// Create creates a new vendor evaluation in the database.
func (r *VendorEvaluationRepositoryImpl) Create(ctx context.Context, evaluation *entities.VendorEvaluation) error {
	query := `
		INSERT INTO vendor_evaluations (
			id, evaluation_number, supplier_id, evaluation_period_start, evaluation_period_end,
			evaluator_id, status, quality_score, delivery_score, price_score, service_score,
			compliance_score, overall_score, quality_comments, delivery_comments, price_comments,
			service_comments, compliance_comments, overall_comments, recommendation, action_items,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
	`
	_, err := r.db.ExecContext(ctx, query,
		evaluation.ID, evaluation.EvaluationNumber, evaluation.SupplierID,
		evaluation.EvaluationPeriodStart, evaluation.EvaluationPeriodEnd,
		evaluation.EvaluatorID, evaluation.Status, evaluation.QualityScore,
		evaluation.DeliveryScore, evaluation.PriceScore, evaluation.ServiceScore,
		evaluation.ComplianceScore, evaluation.OverallScore, evaluation.QualityComments,
		evaluation.DeliveryComments, evaluation.PriceComments, evaluation.ServiceComments,
		evaluation.ComplianceComments, evaluation.OverallComments, evaluation.Recommendation,
		evaluation.ActionItems, evaluation.CreatedAt, evaluation.UpdatedAt,
	)
	return err
}

// GetByID retrieves a vendor evaluation by its ID.
func (r *VendorEvaluationRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.VendorEvaluation, error) {
	query := `
		SELECT
			ve.id, ve.evaluation_number, ve.supplier_id, ve.evaluation_period_start,
			ve.evaluation_period_end, ve.evaluator_id, ve.status, ve.quality_score,
			ve.delivery_score, ve.price_score, ve.service_score, ve.compliance_score,
			ve.overall_score, ve.quality_comments, ve.delivery_comments, ve.price_comments,
			ve.service_comments, ve.compliance_comments, ve.overall_comments,
			ve.recommendation, ve.action_items, ve.created_at, ve.updated_at,
			COALESCE(s.name, '') as supplier_name,
			COALESCE(u.full_name, '') as evaluator_name
		FROM vendor_evaluations ve
		LEFT JOIN suppliers s ON ve.supplier_id = s.id
		LEFT JOIN users u ON ve.evaluator_id = u.id
		WHERE ve.id = $1
	`

	evaluation := &entities.VendorEvaluation{}
	var qualityComments, deliveryComments, priceComments, serviceComments sql.NullString
	var complianceComments, overallComments, actionItems sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&evaluation.ID, &evaluation.EvaluationNumber, &evaluation.SupplierID,
		&evaluation.EvaluationPeriodStart, &evaluation.EvaluationPeriodEnd,
		&evaluation.EvaluatorID, &evaluation.Status, &evaluation.QualityScore,
		&evaluation.DeliveryScore, &evaluation.PriceScore, &evaluation.ServiceScore,
		&evaluation.ComplianceScore, &evaluation.OverallScore, &qualityComments,
		&deliveryComments, &priceComments, &serviceComments, &complianceComments,
		&overallComments, &evaluation.Recommendation, &actionItems,
		&evaluation.CreatedAt, &evaluation.UpdatedAt,
		&evaluation.SupplierName, &evaluation.EvaluatorName,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Handle nullable fields
	if qualityComments.Valid {
		evaluation.QualityComments = &qualityComments.String
	}
	if deliveryComments.Valid {
		evaluation.DeliveryComments = &deliveryComments.String
	}
	if priceComments.Valid {
		evaluation.PriceComments = &priceComments.String
	}
	if serviceComments.Valid {
		evaluation.ServiceComments = &serviceComments.String
	}
	if complianceComments.Valid {
		evaluation.ComplianceComments = &complianceComments.String
	}
	if overallComments.Valid {
		evaluation.OverallComments = &overallComments.String
	}
	if actionItems.Valid {
		evaluation.ActionItems = &actionItems.String
	}

	return evaluation, nil
}

// GetAll retrieves all vendor evaluations with filters.
func (r *VendorEvaluationRepositoryImpl) GetAll(ctx context.Context, filter *repositories.VendorEvaluationFilter) ([]*entities.VendorEvaluation, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT
			ve.id, ve.evaluation_number, ve.supplier_id, ve.evaluation_period_start,
			ve.evaluation_period_end, ve.evaluator_id, ve.status, ve.quality_score,
			ve.delivery_score, ve.price_score, ve.service_score, ve.compliance_score,
			ve.overall_score, ve.quality_comments, ve.delivery_comments, ve.price_comments,
			ve.service_comments, ve.compliance_comments, ve.overall_comments,
			ve.recommendation, ve.action_items, ve.created_at, ve.updated_at,
			COALESCE(s.name, '') as supplier_name,
			COALESCE(u.full_name, '') as evaluator_name
		FROM vendor_evaluations ve
		LEFT JOIN suppliers s ON ve.supplier_id = s.id
		LEFT JOIN users u ON ve.evaluator_id = u.id
	`

	countQuery := `SELECT COUNT(*) FROM vendor_evaluations ve`

	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(ve.evaluation_number ILIKE $%d OR s.name ILIKE $%d)", argNum, argNum))
		args = append(args, "%"+filter.Search+"%")
		argNum++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("ve.status = $%d", argNum))
		args = append(args, filter.Status)
		argNum++
	}
	if filter.SupplierID != "" {
		conditions = append(conditions, fmt.Sprintf("ve.supplier_id = $%d", argNum))
		args = append(args, filter.SupplierID)
		argNum++
	}
	if filter.EvaluatorID != "" {
		conditions = append(conditions, fmt.Sprintf("ve.evaluator_id = $%d", argNum))
		args = append(args, filter.EvaluatorID)
		argNum++
	}
	if filter.Recommendation != "" {
		conditions = append(conditions, fmt.Sprintf("ve.recommendation = $%d", argNum))
		args = append(args, filter.Recommendation)
		argNum++
	}
	if filter.MinOverallScore > 0 {
		conditions = append(conditions, fmt.Sprintf("ve.overall_score >= $%d", argNum))
		args = append(args, filter.MinOverallScore)
		argNum++
	}
	if filter.MaxOverallScore > 0 {
		conditions = append(conditions, fmt.Sprintf("ve.overall_score <= $%d", argNum))
		args = append(args, filter.MaxOverallScore)
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	var total int
	err := r.db.QueryRowContext(ctx, countQuery+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Build order clause
	orderBy := "ve.evaluation_period_end DESC, ve.created_at DESC"
	if filter.SortBy != "" {
		order := "ASC"
		if strings.ToUpper(filter.SortOrder) == "DESC" {
			order = "DESC"
		}
		orderBy = fmt.Sprintf("ve.%s %s", filter.SortBy, order)
	}

	// Add pagination
	offset := (filter.Page - 1) * filter.Limit
	query := fmt.Sprintf("%s%s ORDER BY %s LIMIT %d OFFSET %d",
		baseQuery, whereClause, orderBy, filter.Limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var evaluations []*entities.VendorEvaluation
	for rows.Next() {
		evaluation := &entities.VendorEvaluation{}
		var qualityComments, deliveryComments, priceComments, serviceComments sql.NullString
		var complianceComments, overallComments, actionItems sql.NullString

		err := rows.Scan(
			&evaluation.ID, &evaluation.EvaluationNumber, &evaluation.SupplierID,
			&evaluation.EvaluationPeriodStart, &evaluation.EvaluationPeriodEnd,
			&evaluation.EvaluatorID, &evaluation.Status, &evaluation.QualityScore,
			&evaluation.DeliveryScore, &evaluation.PriceScore, &evaluation.ServiceScore,
			&evaluation.ComplianceScore, &evaluation.OverallScore, &qualityComments,
			&deliveryComments, &priceComments, &serviceComments, &complianceComments,
			&overallComments, &evaluation.Recommendation, &actionItems,
			&evaluation.CreatedAt, &evaluation.UpdatedAt,
			&evaluation.SupplierName, &evaluation.EvaluatorName,
		)
		if err != nil {
			return nil, 0, err
		}

		if qualityComments.Valid {
			evaluation.QualityComments = &qualityComments.String
		}
		if deliveryComments.Valid {
			evaluation.DeliveryComments = &deliveryComments.String
		}
		if priceComments.Valid {
			evaluation.PriceComments = &priceComments.String
		}
		if serviceComments.Valid {
			evaluation.ServiceComments = &serviceComments.String
		}
		if complianceComments.Valid {
			evaluation.ComplianceComments = &complianceComments.String
		}
		if overallComments.Valid {
			evaluation.OverallComments = &overallComments.String
		}
		if actionItems.Valid {
			evaluation.ActionItems = &actionItems.String
		}

		evaluations = append(evaluations, evaluation)
	}

	return evaluations, total, rows.Err()
}

// Update updates an existing vendor evaluation.
func (r *VendorEvaluationRepositoryImpl) Update(ctx context.Context, evaluation *entities.VendorEvaluation) error {
	query := `
		UPDATE vendor_evaluations SET
			status = $2, quality_score = $3, delivery_score = $4, price_score = $5,
			service_score = $6, compliance_score = $7, overall_score = $8,
			quality_comments = $9, delivery_comments = $10, price_comments = $11,
			service_comments = $12, compliance_comments = $13, overall_comments = $14,
			recommendation = $15, action_items = $16, updated_at = $17
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		evaluation.ID, evaluation.Status, evaluation.QualityScore, evaluation.DeliveryScore,
		evaluation.PriceScore, evaluation.ServiceScore, evaluation.ComplianceScore,
		evaluation.OverallScore, evaluation.QualityComments, evaluation.DeliveryComments,
		evaluation.PriceComments, evaluation.ServiceComments, evaluation.ComplianceComments,
		evaluation.OverallComments, evaluation.Recommendation, evaluation.ActionItems,
		evaluation.UpdatedAt,
	)
	return err
}

// Delete deletes a vendor evaluation.
func (r *VendorEvaluationRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM vendor_evaluations WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetBySupplierID retrieves all evaluations for a supplier.
func (r *VendorEvaluationRepositoryImpl) GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.VendorEvaluation, error) {
	filter := &repositories.VendorEvaluationFilter{
		SupplierID: supplierID,
		Page:       1,
		Limit:      1000,
	}
	evaluations, _, err := r.GetAll(ctx, filter)
	return evaluations, err
}

// GetSupplierAverageScore retrieves the average overall score for a supplier.
func (r *VendorEvaluationRepositoryImpl) GetSupplierAverageScore(ctx context.Context, supplierID string) (float64, error) {
	query := `
		SELECT COALESCE(AVG(overall_score), 0)
		FROM vendor_evaluations
		WHERE supplier_id = $1 AND status = 'approved'
	`

	var avgScore float64
	err := r.db.QueryRowContext(ctx, query, supplierID).Scan(&avgScore)
	if err != nil {
		return 0, err
	}

	return avgScore, nil
}

// GetStats retrieves vendor evaluation statistics.
func (r *VendorEvaluationRepositoryImpl) GetStats(ctx context.Context) (*repositories.VendorEvaluationStats, error) {
	query := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'draft') as draft,
			COUNT(*) FILTER (WHERE status = 'completed') as completed,
			COUNT(*) FILTER (WHERE status = 'approved') as approved,
			COALESCE(AVG(overall_score) FILTER (WHERE status = 'approved'), 0) as average_overall_score,
			COUNT(*) FILTER (WHERE recommendation = 'preferred') as preferred_count,
			COUNT(*) FILTER (WHERE recommendation = 'approved') as approved_count,
			COUNT(*) FILTER (WHERE recommendation = 'conditional') as conditional_count,
			COUNT(*) FILTER (WHERE recommendation = 'not_recommended') as not_recommended_count
		FROM vendor_evaluations
	`

	stats := &repositories.VendorEvaluationStats{}
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.Total, &stats.Draft, &stats.Completed, &stats.Approved,
		&stats.AverageOverallScore, &stats.PreferredCount, &stats.ApprovedCount,
		&stats.ConditionalCount, &stats.NotRecommendedCount,
	)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// GetNextEvaluationNumber generates the next evaluation number.
func (r *VendorEvaluationRepositoryImpl) GetNextEvaluationNumber(ctx context.Context) (string, error) {
	year := time.Now().Year()
	prefix := fmt.Sprintf("VE-%d-", year)

	query := `
		SELECT COALESCE(MAX(CAST(SUBSTRING(evaluation_number FROM '\d+$') AS INTEGER)), 0) + 1
		FROM vendor_evaluations
		WHERE evaluation_number LIKE $1
	`

	var nextNum int
	err := r.db.QueryRowContext(ctx, query, prefix+"%").Scan(&nextNum)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s%05d", prefix, nextNum), nil
}
