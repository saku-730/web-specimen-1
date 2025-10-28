// internal/handler/specimen_method_handler.go
package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/saku-730/web-specimen/backend/internal/service"
)

type SpecimenMethodHandler interface {
	GetAll(c *gin.Context)
}

type specimenMethodHandler struct {
	service service.SpecimenMethodService
}

func NewSpecimenMethodHandler(s service.SpecimenMethodService) SpecimenMethodHandler {
	return &specimenMethodHandler{service: s}
}

func (h *specimenMethodHandler) GetAll(c *gin.Context) {
	methods, err := h.service.GetAllSpecimenMethods()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve specimen methods"})
		return
	}

	c.JSON(http.StatusOK, methods)
}
