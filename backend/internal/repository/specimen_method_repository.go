// internal/repository/specimen_method_repository.go
package repository

import (
	"github.com/saku-730/web-specimen/backend/internal/entity"
	"gorm.io/gorm"
)

// SpecimenMethodRepository は specimen_methods テーブルの操作を定義するインターフェースなのだ
type SpecimenMethodRepository interface {
	FindAll() ([]entity.SpecimenMethod, error)
}

type specimenMethodRepository struct {
	db *gorm.DB
}

// NewSpecimenMethodRepository は新しいリポジトリのインスタンスを作成するのだ
func NewSpecimenMethodRepository(db *gorm.DB) SpecimenMethodRepository {
	return &specimenMethodRepository{db: db}
}

// FindAll は specimen_methods テーブルの全レコードを取得するのだ
func (r *specimenMethodRepository) FindAll() ([]entity.SpecimenMethod, error) {
	var methods []entity.SpecimenMethod
	if err := r.db.Find(&methods).Error; err != nil {
		return nil, err
	}
	return methods, nil
}
