package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	host     = "pg-20a74ccc-nikhilkr2604-8f59.e.aivencloud.com"
	port     = 24068
	user     = "avnadmin"
	password = "AVNS_JZl66WGqxVuo7x0MUxh"
	dbname   = "gametube"
	sslmode  = "require"
)

func ConnectDB() (*sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}
