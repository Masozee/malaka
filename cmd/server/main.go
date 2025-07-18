package main

import (
	"log"

	"github.com/jmoiron/sqlx"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"malaka/internal/config"
	"malaka/internal/server/container"
	"malaka/internal/server/http"
	"malaka/internal/shared/database"
	"malaka/internal/shared/logger"
)

func main() {
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	logger, err := logger.NewLogger()
	if err != nil {
		log.Fatalf("cannot create logger: %v", err)
	}
	defer logger.Sync() // flushes buffer, if any

	dbConfig := config.DatabaseConfig{
		Username: "postgres",
		Password: "TanahAbang1971",
		DBName:   "malaka",
		Host:     "localhost",
		Port:     "5432",
	}

	conn, err := database.Connect(dbConfig.ConnectionString())
	if err != nil {
		log.Fatalf("cannot connect to db: %v", err)
	}
	defer func(conn *sqlx.DB) {
		err := conn.Close()
		if err != nil {
			log.Printf("error closing database connection: %v", err)
		}
	}(conn)

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: conn.DB,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("cannot connect to gorm db: %v", err)
	}

	appContainer := container.NewContainer(&cfg, logger, conn.DB, gormDB)

	server, err := http.NewServer(&cfg, logger, appContainer)
	if err != nil {
		log.Fatalf("cannot create server: %v", err)
	}

	err = server.Start(cfg.ServerAddress)
	if err != nil {
		log.Fatalf("cannot start server: %v", err)
	}
}