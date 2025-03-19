package dtos

type SignUpDTO struct {
	Fullname   string `json:"fullname" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	Dob        string `json:"dob" binding:"required"`
	Avatar     string `json:"avatar" binding:"required"`
	CoverImage string `json:"coverImage" binding:"required"`
}

type LoginDTO struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
}

type UserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Fullame  string `json:"fullname"`
	CreatedAt string `json:"createdAt"`
}