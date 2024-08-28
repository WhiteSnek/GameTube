package models

import (
    "time"
    "github.com/google/uuid"
	"github.com/dgrijalva/jwt-go"
    "golang.org/x/crypto/bcrypt"
	"database/sql"
	"os"
    "log"
    "github.com/joho/godotenv"
)

type User struct {
    ID         uuid.UUID `json:"id"`
    Username   string    `json:"username"`
    Email      string    `json:"email"`
    Password   string    `json:"password"`
    FullName   string    `json:"fullname"`
    Avatar     string    `json:"avatar"`
    CoverImage string    `json:"cover_image"`
    Dob        string `json:"dob"`
    Gender     string    `json:"gender"`
    GoogleID   *string    `json:"googleId"`
    Guild      *uuid.UUID   `json:"guild,omitempty"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}

var accessTokenSecret []byte
var refreshTokenSecret []byte

var (
    accessTokenExpiry  = 15 * time.Minute // Adjust as needed
    refreshTokenExpiry = 7 * 24 * time.Hour // Adjust as needed
)

func init() {
    if err := godotenv.Load(); err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }
    accessTokenSecret = []byte(os.Getenv("ACCESS_TOKEN_SECRET"))
    refreshTokenSecret = []byte(os.Getenv("REFRESH_TOKEN_SECRET"))
    if len(accessTokenSecret) == 0 || len(refreshTokenSecret) == 0 {
        log.Fatalf("Token secrets must be set in environment variables")
    }
}

// Hash the password before saving it to the database
func (u *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

// Compare the hashed password with the provided password
func (u *User) IsPasswordCorrect(password string) (bool, error) {
    return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) == nil, nil
}

// Generate JWT access token
func (u *User) GenerateAccessToken() (string, error) {
    claims := jwt.MapClaims{
        "id":       u.ID,
        "email":    u.Email,
        "username": u.Username,
        "fullname": u.FullName,
        "exp":      time.Now().Add(accessTokenExpiry).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(accessTokenSecret)
}

// Generate JWT refresh token
func (u *User) GenerateRefreshToken() (string, error) {
    claims := jwt.MapClaims{
        "id":       u.ID,
        "email":    u.Email,
        "username": u.Username,
        "fullname": u.FullName,
        "exp":      time.Now().Add(refreshTokenExpiry).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(refreshTokenSecret)
}

func GetUserByID(db *sql.DB, id uuid.UUID) (*User, error) {
    query := `SELECT id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at 
              FROM users WHERE id = $1`
    var user User
    row := db.QueryRow(query, id)
    err := row.Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.Password,
        &user.FullName,
        &user.Avatar,
        &user.CoverImage,
        &user.Dob,
        &user.Gender,
        &user.GoogleID,
        &user.Guild,
        &user.CreatedAt,
        &user.UpdatedAt,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil // User not found
        }
        return nil, err // Other error
    }
    return &user, nil
}