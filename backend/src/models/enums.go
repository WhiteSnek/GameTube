package models

type Role string

const (
	MEMBER    Role = "MEMBER"
	LEADER    Role = "LEADER"
	CO_LEADER Role = "CO_LEADER"
	ELDER     Role = "ELDER"
)

type Status string

const (
	PENDING  Status = "PENDING"
	APPROVED Status = "APPROVED"
	REJECTED Status = "REJECTED"
)

type Entity string

const (
	VIDEO   Entity = "VIDEO"
	COMMENT Entity = "COMMENT"
	REPLY   Entity = "REPLY"
)