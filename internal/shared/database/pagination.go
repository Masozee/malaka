package database

// Pagination holds pagination parameters.
type Pagination struct {
	Limit  int
	Offset int
}

// NewPagination creates a new Pagination object.
func NewPagination(limit, offset int) *Pagination {
	return &Pagination{
		Limit:  limit,
		Offset: offset,
	}
}
