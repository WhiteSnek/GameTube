package models

type Like struct {
	ID string `gorm:"type:varchar(191);primaryKey"`

	EntityType Entity

	OwnerID string

	VideoID   *string
	CommentID *string
	ReplyID   *string

	Owner User `gorm:"foreignKey:OwnerID"`

	Video   *Video   `gorm:"foreignKey:VideoID"`
	Comment *Comment `gorm:"foreignKey:CommentID"`
	Reply   *Reply   `gorm:"foreignKey:ReplyID"`
}