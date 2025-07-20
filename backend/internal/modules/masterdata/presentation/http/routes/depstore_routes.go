package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/masterdata/presentation/http/handlers"
)

// DepstoreRoutes sets up the routes for department store operations.
func DepstoreRoutes(r *gin.RouterGroup, handler *handlers.DepstoreHandler) {
	depstores := r.Group("/depstores")
	{
		depstores.POST("/", handler.CreateDepstore)
		depstores.GET("/", handler.GetAllDepstores)
		depstores.GET("/:id", handler.GetDepstoreByID)
		depstores.GET("/code/:code", handler.GetDepstoreByCode)
		depstores.PUT("/:id", handler.UpdateDepstore)
		depstores.DELETE("/:id", handler.DeleteDepstore)
	}
}