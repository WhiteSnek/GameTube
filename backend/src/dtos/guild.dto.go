package dtos

type CreateGuildDTO struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	Avatar      *string `json:"avatar,omitempty"`
	CoverImage  *string `json:"cover_image,omitempty"`
	IsPrivate   bool    `json:"isPrivate"`
}

type GuildType struct {
	ID          string  `json:"id" binding:"required"`
	OwnerID     string  `json:"ownerId" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	Avatar      *string `json:"avatar,omitempty"`
	CoverImage  *string `json:"cover_image,omitempty"`
}

type GuildDetails struct {
	ID          string  `json:"id" binding:"required"`
	OwnerID     string  `json:"ownerId" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	Avatar      *string `json:"avatar,omitempty"`
	CoverImage  *string `json:"cover_image,omitempty"`
	Joined		bool	`json:"joined" binding:"required"`	
}

type JoinedGuilds struct {
	ID          string  `json:"id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Avatar      *string `json:"avatar,omitempty"`
	Role 		string 	`json:"role" binding:"required"`
}
