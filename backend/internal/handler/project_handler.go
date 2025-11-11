// internal/handler/project_handler.go
package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/saku-730/web-specimen/backend/internal/service"
)

type ProjectHandler interface {
	GetAll(c *gin.Context)
}

type projectHandler struct {
	service service.ProjectService
}

func NewProjectHandler(s service.ProjectService) ProjectHandler {
	return &projectHandler{service: s}
}

func (h *projectHandler) GetAll(c *gin.Context) {
	projects, err := h.service.GetAllProjects()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}
