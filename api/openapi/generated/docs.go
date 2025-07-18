package generated

import (
	"embed"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed masterdata.yaml
var content embed.FS

// ServeDocs serves the OpenAPI documentation as YAML.
func ServeDocs() gin.HandlerFunc {
	return func(c *gin.Context) {
		contentBytes, err := content.ReadFile("masterdata.yaml")
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Writer.Header().Set("Content-Type", "text/yaml")
		c.String(http.StatusOK, string(contentBytes))
	}
}

// ServeRedoc serves the Redoc documentation page.
func ServeRedoc() gin.HandlerFunc {
	return func(c *gin.Context) {
		html := `<!DOCTYPE html>
<html>
<head>
    <title>Malaka ERP API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <redoc spec-url='/api/docs/openapi.yaml'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"></script>
</body>
</html>`
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, html)
	}
}
