// internal/repository/user_repository.go
package repository

import (
	"github.com/saku-730/web-specimen/backend/internal/entity"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByEmail(email string) (*entity.User, error)
	FindAll() ([]entity.User, error) // ⬅️ この行を追加！
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByEmail(email string) (*entity.User, error) {
	var user entity.User
	if err := r.db.Where("mail_address = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}


func (r *userRepository) FindAll() ([]entity.User, error) {
	var users []entity.User
	// レスポンスでRole名を返すために、UserRoleをPreload(事前読み込み)するのが大事なのだ！
	if err := r.db.Preload("UserRole").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
