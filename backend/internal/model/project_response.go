// internal/model/project_response.go
package model

import "time"

// ProjectResponse は GET /project で返すリストの各要素の型なのだ
type ProjectResponse struct {
	ProjectID     uint      `json:"project_id"`
	ProjectName   *string    `json:"project_name"`
	Description   *string   `json:"description,omitempty"`
	StartDate     *time.Time `json:"start_date,omitempty"`  // 日付型はポインタにしてnilを許容するのだ
	FinishedDate  *time.Time `json:"finished_date,omitempty"`
	Note          *string   `json:"note,omitempty"`
	ProjectMember []uint    `json:"project_member"` // メンバーのIDリスト
}
