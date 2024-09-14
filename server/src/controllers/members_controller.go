package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type JoinLeave struct {
	UserId uuid.UUID `json:"userId"`
	GuildId uuid.UUID `json:"guildId"`
}

type UserDetails struct {
	UserId   string `json:"userId"`
	GuildId  string `json:"guildId"`
	MemberId string `json:"memberId"`
}

func JoinGuild(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var response JoinLeave
		err := json.NewDecoder(r.Body).Decode(&response)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}
		
		// Correcting SQL query by using $3 for userRole
		memberQuery := `INSERT INTO members (userId, guildId, userRole, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`
		_, err = db.Exec(memberQuery, response.UserId, response.GuildId, "member")
		if err != nil {
			http.Error(w, "Failed to add member role: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set header first, then write status code and response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		res := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(res)
	}
}


func GetGuildMembers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		guildId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid guild ID", http.StatusBadRequest)
			return
		}

		type GuildMembers struct {
			UserId     string `json:"userId"`
			MemberRole string `json:"userRole"`
			UserName   string `json:"userName"`
			UserAvatar string `json:"userAvatar"`
			JoinedAt time.Time `json:"joinedAt"`
		}

		var members []GuildMembers

		query := `SELECT m.userId, m.userRole, m.created_at, u.username, u.avatar 
				  FROM members m 
				  JOIN users u ON m.userId = u.id 
				  WHERE m.guildId = $1`

		rows, err := db.Query(query, guildId)
		if err != nil {
			http.Error(w, "Failed to get guild members: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var member GuildMembers
			err := rows.Scan(&member.UserId, &member.MemberRole, &member.JoinedAt, &member.UserName, &member.UserAvatar)
			if err != nil {
				http.Error(w, "Error scanning member data: "+err.Error(), http.StatusInternalServerError)
				return
			}
			members = append(members, member)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, "Error retrieving rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(members)
	}
}

func GetUserGuilds(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		type UserGuilds struct {
			GuildId     string `json:"guildId"`
			MemberRole  string `json:"userRole"`
			GuildName   string `json:"guildName"`
			GuildAvatar string `json:"guildAvatar"`
			JoinedAt time.Time `json:"joinedAt"`
		}

		var guilds []UserGuilds

		query := `SELECT m.guildId, m.userRole, m.created_at, g.guild_name, g.avatar 
				  FROM members m 
				  JOIN guilds g ON m.guildId = g.id 
				  WHERE m.userId = $1`

		rows, err := db.Query(query, userId)
		if err != nil {
			http.Error(w, "Failed to get user guilds: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var guild UserGuilds
			err := rows.Scan(&guild.GuildId, &guild.MemberRole, &guild.JoinedAt, &guild.GuildName, &guild.GuildAvatar)
			if err != nil {
				http.Error(w, "Error scanning guild data: "+err.Error(), http.StatusInternalServerError)
				return
			}
			guilds = append(guilds, guild)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, "Error retrieving rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(guilds)
	}
}


func PromoteUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		
		var details UserDetails

		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Step 1: Verify if the requester is the guild leader
		var role string
		checkLeader := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkLeader, details.UserId, details.GuildId).Scan(&role)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify leader: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Only guild leaders can promote
		if role != "leader" && role != "coleader" {
			http.Error(w, "Only guild leader and co leaders can promote members", http.StatusForbidden)
			return
		}

		// Step 2: Check the role of the member to be promoted
		var memberRole string
		checkUserRole := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkUserRole, details.MemberId, details.GuildId).Scan(&memberRole)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Member not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify member role: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 3: Determine the new role based on the current role
		var newRole string
		switch memberRole {
		case "member":
			newRole = "elder"
		case "elder":
			newRole = "coleader"
		default:
			http.Error(w, "Cannot promote further from the current role", http.StatusForbidden)
			return
		}

		// Step 4: Update the role of the member in the database
		updateQuery := `UPDATE members SET userRole = $1 WHERE userId = $2 AND guildId = $3`
		_, err = db.Exec(updateQuery, newRole, details.MemberId, details.GuildId)
		if err != nil {
			http.Error(w, "Failed to promote member: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 5: Send success response
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Member promoted to " + newRole + " successfully"))
	}
}


func DemoteUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var details UserDetails

		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Step 1: Verify if the requester is the guild leader
		var role string
		checkLeader := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkLeader, details.UserId, details.GuildId).Scan(&role)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify leader: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Only guild leaders can promote
		if role != "leader" && role != "coleader" {
			http.Error(w, "Only guild leaders and co leaders can promote members", http.StatusForbidden)
			return
		}

		// Step 2: Check the role of the member to be demoted
		var memberRole string
		checkUserRole := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkUserRole, details.MemberId, details.GuildId).Scan(&memberRole)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Member not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify member role: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 3: Determine the new role based on the current role
		var newRole string
		switch memberRole {
		case "coleader":
			newRole = "elder"
		case "elder":
			newRole = "member"
		default:
			http.Error(w, "Cannot demote further from the current role", http.StatusForbidden)
			return
		}

		// Step 4: Update the role of the member in the database
		updateQuery := `UPDATE members SET userRole = $1 WHERE userId = $2 AND guildId = $3`
		_, err = db.Exec(updateQuery, newRole, details.MemberId, details.GuildId)
		if err != nil {
			http.Error(w, "Failed to demote member: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 5: Send success response
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Member demoted to " + newRole + " successfully"))
	}
}

func KickUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r* http.Request){
		var details JoinLeave;
		err := json.NewDecoder(r.Body).Decode(&details);
		if err != nil {
			http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
			return
		}
		var role string
		checkLeader := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkLeader, details.UserId, details.GuildId).Scan(&role)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify leader: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Only guild leaders can promote
		if role != "leader" && role != "coleader" {
			http.Error(w, "Only guild leader and co leaders can kick members", http.StatusForbidden)
			return
		}
		query := `DELETE from members where userId = $1 and guildId = $2`;
		_, err = db.Exec(query, details.UserId, details.GuildId)
		if err != nil {
			http.Error(w, "Failed to kick user: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("User kicked out successfully"))
	}
}

func LeaveGuild(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r* http.Request){
		var details JoinLeave;
		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Step 1: Verify if the user is a member of the guild
		var userRole string
		checkMembership := `SELECT userRole FROM members WHERE userId = $1 AND guildId = $2`
		err = db.QueryRow(checkMembership, details.UserId, details.GuildId).Scan(&userRole)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found in guild", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to verify membership: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 2: Prevent the guild leader from leaving without assigning a new leader
		if userRole == "leader" {
			http.Error(w, "Guild leader cannot leave without assigning a new leader", http.StatusForbidden)
			return
		}

		// Step 3: Delete the user from the guild members table
		query := `DELETE FROM members WHERE userId = $1 AND guildId = $2`
		_, err = db.Exec(query, details.UserId, details.GuildId)
		if err != nil {
			http.Error(w, "Failed to leave guild: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Step 4: Send success response
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Successfully left the guild"))
	}
}

func CheckMembership(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var details JoinLeave

		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
			return
		}


		query := `SELECT COUNT(*) FROM members WHERE userId = $1 AND guildId = $2`
		var count int

		err = db.QueryRow(query, details.UserId, details.GuildId).Scan(&count)
		if err != nil {
			http.Error(w, "Database query error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Return JSON response with true if the user is a member, false otherwise
		response := map[string]bool{"isMember": count > 0}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
