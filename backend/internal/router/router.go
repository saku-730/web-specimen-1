// internal/router/router.go
package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/saku-730/web-specimen/backend/internal/handler"
	"github.com/saku-730/web-specimen/backend/internal/middleware"
)

func SetupRouter(
	authHandler handler.AuthHandler,
	occHandler handler.OccurrenceHandler,
	spcMethodHandler handler.SpecimenMethodHandler,
	authMiddleware middleware.AuthMiddleware,

)*gin.Engine {
	router := gin.Default()

	//CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:8989"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	router.Use(cors.New(config))

	//API Version
	apiV0_0_2 := router.Group("/api/v0_0_2")//router.Group() make gin.RouterGroup
	{
		apiV0_0_2.POST("/login", authHandler.Login)

		secure := apiV0_0_2.Group("")
		secure.Use(authMiddleware.Auth())
		{	// /create page
			secure.GET("/create", occHandler.GetCreatePage)
			secure.POST("/create", occHandler.CreateOccurrence)
			secure.POST("/create/:occurrence_id/attachments", occHandler.AttachFiles)
			secure.GET("/search", occHandler.SearchPage)
			secure.GET("/occurrences/:occurrence_id", occHandler.GetOccurrenceDetail)
			secure.PUT("/occurrences/:occurrence_id", occHandler.UpdateOccurrence)
			secure.GET("/specimen", spcMethodHandler.GetAll)
		}

	}
	return router
}
