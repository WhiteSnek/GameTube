package dtos

type UploadVideoDTO struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	GuildID     string   `json:"guildId" binding:"required"`
	Thumbnail   string   `json:"thumbnail" binding:"required"`
	VideoUrl    string   `json:"videoUrl" binding:"required"`
	Duration    int64    `json:"duration" binding:"required"`
	IsPrivate   *bool    `json:"isPrivate" binding:"required"`
	Tags        []string `json:"tags" binding:"required"`
}

type VideoDetails struct {
	Id          string   `json:"id" binding:"required"`
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Thumbnail   string   `json:"thumbnail" binding:"required"`
	VideoUrl    string   `json:"videoUrl" binding:"required"`
	Duration    int64    `json:"duration" binding:"required"`
	OwnerName   string   `json:"ownerName" binding:"required"`
	GuildId 	string   `json:"guildId" binding:"required"`
	GuildAvatar string   `json:"guildAvatar,omitempty"`
	GuildName   string   `json:"guildName" binding:"required"`
	Tags        []string `json:"tags" binding:"required"`
	Likes       int      `json:"likes" binding:"required"`
	Views       int      `json:"views" binding:"required"`
	CreatedAt   string   `json:"uploadDate" binding:"required"`
}

type MultiVideos struct {
	EntityId    string `json:"entityId,omitempty"`
	Id          string `json:"id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Thumbnail   string `json:"thumbnail" binding:"required"`
	VideoUrl    string `json:"videoUrl" binding:"required"`
	Duration    int64  `json:"duration" binding:"required"`
	Views       int    `json:"views" binding:"required"`
	OwnerName   string `json:"ownerName" binding:"required"`
	GuildAvatar string `json:"guildAvatar,omitempty"`
	GuildName   string `json:"guildName" binding:"required"`
	CreatedAt   string `json:"uploadDate" binding:"required"`
}
