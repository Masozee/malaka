package presentation

import (
	"encoding/json"
	"net/http"

	"malaka/internal/modules/accounting/application"

	"github.com/go-chi/chi/v5"
)

// CostCenterHandler handles HTTP requests for Cost Centers.
type CostCenterHandler struct {
	service *application.CostCenterService
}

// NewCostCenterHandler creates a new CostCenterHandler.
func NewCostCenterHandler(service *application.CostCenterService) *CostCenterHandler {
	return &CostCenterHandler{
		service: service,
	}
}

// CreateCostCenterRequest represents the request body for creating a cost center.
type CreateCostCenterRequest struct {
	Name string `json:"name"`
	Code string `json:"code"`
}

// UpdateCostCenterRequest represents the request body for updating a cost center.
type UpdateCostCenterRequest struct {
	Name string `json:"name"`
	Code string `json:"code"`
}

// CostCenterResponse represents the response body for a cost center.
type CostCenterResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Code      string `json:"code"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// CreateCostCenter handles the creation of a new cost center.
func (h *CostCenterHandler) CreateCostCenter(w http.ResponseWriter, r *http.Request) {
	var req CreateCostCenterRequest
	if err := json.NewDecoder(r.Body).Decode(&req);
	err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	costCenter, err := h.service.CreateCostCenter(r.Context(), req.Name, req.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := CostCenterResponse{
		ID:        costCenter.ID,
		Name:      costCenter.Name,
		Code:      costCenter.Code,
		CreatedAt: costCenter.CreatedAt.Format(http.TimeFormat),
		UpdatedAt: costCenter.UpdatedAt.Format(http.TimeFormat),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

// GetCostCenterByID handles retrieving a cost center by ID.
func (h *CostCenterHandler) GetCostCenterByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	costCenter, err := h.service.GetCostCenterByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	res := CostCenterResponse{
		ID:        costCenter.ID,
		Name:      costCenter.Name,
		Code:      costCenter.Code,
		CreatedAt: costCenter.CreatedAt.Format(http.TimeFormat),
		UpdatedAt: costCenter.UpdatedAt.Format(http.TimeFormat),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// GetAllCostCenters handles retrieving all cost centers.
func (h *CostCenterHandler) GetAllCostCenters(w http.ResponseWriter, r *http.Request) {
	costCenters, err := h.service.GetAllCostCenters(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resList := make([]CostCenterResponse, len(costCenters))
	for i, cc := range costCenters {
		resList[i] = CostCenterResponse{
			ID:        cc.ID,
			Name:      cc.Name,
			Code:      cc.Code,
			CreatedAt: cc.CreatedAt.Format(http.TimeFormat),
			UpdatedAt: cc.UpdatedAt.Format(http.TimeFormat),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resList)
}

// UpdateCostCenter handles updating an existing cost center.
func (h *CostCenterHandler) UpdateCostCenter(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	var req UpdateCostCenterRequest
	if err := json.NewDecoder(r.Body).Decode(&req);
	err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	costCenter, err := h.service.UpdateCostCenter(r.Context(), id, req.Name, req.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := CostCenterResponse{
		ID:        costCenter.ID,
		Name:      costCenter.Name,
		Code:      costCenter.Code,
		CreatedAt: costCenter.CreatedAt.Format(http.TimeFormat),
		UpdatedAt: costCenter.UpdatedAt.Format(http.TimeFormat),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// DeleteCostCenter handles deleting a cost center by ID.
func (h *CostCenterHandler) DeleteCostCenter(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteCostCenter(r.Context(), id);
	err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RegisterRoutes registers the cost center routes with the given router.
func (h *CostCenterHandler) RegisterRoutes(r chi.Router) {
	r.Post("/costcenters", h.CreateCostCenter)
	r.Get("/costcenters/{id}", h.GetCostCenterByID)
	r.Get("/costcenters", h.GetAllCostCenters)
	r.Put("/costcenters/{id}", h.UpdateCostCenter)
	r.Delete("/costcenters/{id}", h.DeleteCostCenter)
}
