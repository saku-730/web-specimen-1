// internal/model/user_response.go
package model

// UserResponse は GET /user で返すリストの各要素の型なのだ
type UserResponse struct {
	UserID   uint   `json:"user_id"`
	UserName string `json:"user_name"`
	Email    string `json:"email"` // mail_address からマッピングする
	Role     string `json:"role"`  // user_roles テーブルから取得する
}
