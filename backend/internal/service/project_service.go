// internal/service/project_service.go
package service

import (
	"github.com/saku-730/web-specimen/backend/internal/model"
	"github.com/saku-730/web-specimen/backend/internal/repository"
)

type ProjectService interface {
	GetAllProjects() ([]model.ProjectResponse, error)
}

type projectService struct {
	repo repository.ProjectRepository
}

func NewProjectService(repo repository.ProjectRepository) ProjectService {
	return &projectService{repo: repo}
}

func (s *projectService) GetAllProjects() ([]model.ProjectResponse, error) {
	// 1. リポジトリから関連データ（ProjectMembers）込みでDBの生データを取得
	projects, err := s.repo.FindAllWithMembers()
	if err != nil {
		return nil, err
	}

	// 2. entityからレスポンス用のmodelに変換（マッピング）する
	responses := make([]model.ProjectResponse, 0, len(projects))
	
	for _, project := range projects {
		// --- ここが大事な変換処理なのだ ---
		// project.ProjectMembers（構造体のリスト）から、
		// user_id（数値のリスト）だけを抜き出す
		memberIDs := make([]uint, 0, len(project.ProjectMembers))
		for _, member := range project.ProjectMembers {
			if member.UserID != nil {
				memberIDs = append(memberIDs, *member.UserID)
			}
		}
		// --- 変換終わり ---

		responses = append(responses, model.ProjectResponse{
			ProjectID:     project.ProjectID,
			ProjectName:   project.ProjectName,
			Description:   project.Description,
			StartDate:     project.StartDate,
			FinishedDate:  project.FinishedDate,
			Note:          project.Note,
			ProjectMember: memberIDs, // 抜き出したIDリストをセット
		})
	}

	return responses, nil
}
