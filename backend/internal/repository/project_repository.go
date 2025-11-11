// internal/repository/project_repository.go
package repository

import (
	"github.com/saku-730/web-specimen/backend/internal/entity"
	"gorm.io/gorm"
)

// ProjectRepository は projects テーブルの操作を定義するインターフェースなのだ
type ProjectRepository interface {
	FindAllWithMembers() ([]entity.Project, error)
}

type projectRepository struct {
	db *gorm.DB
}

// NewProjectRepository は新しいリポジトリのインスタンスを作成するのだ
func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepository{db: db}
}

// FindAllWithMembers は、全プロジェクトを、関連するProjectMembersと一緒に取得するのだ
func (r *projectRepository) FindAllWithMembers() ([]entity.Project, error) {
	var projects []entity.Project
	
	// "ProjectMembers"は、entity.Project構造体で定義されたリレーションのフィールド名なのだ
	// これで、各プロジェクトに関連するproject_membersの行も一緒に取ってこれるのだ
	if err := r.db.Preload("ProjectMembers").Find(&projects).Error; err != nil {
		return nil, err
	}
	return projects, nil
}
