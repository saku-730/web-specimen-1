// internal/handler/user_handler.go
package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/saku-730/web-specimen/backend/internal/service"
)

type UserHandler interface {
	GetAll(c *gin.Context)
}

type userHandler struct {
	service service.UserService
}

func NewUserHandler(s service.UserService) UserHandler {
	return &userHandler{service: s}
}

func (h *userHandler) GetAll(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	c.JSON(http.StatusOK, users)
}
