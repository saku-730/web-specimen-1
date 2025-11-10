// internal/service/user_service.go
package service

import (
	"github.com/saku-730/web-specimen/backend/internal/model"
	"github.com/saku-730/web-specimen/backend/internal/repository"
)

// UserService はユーザー情報に関するビジネスロジックのインターフェースなのだ
type UserService interface {
	GetAllUsers() ([]model.UserResponse, error)
}

type userService struct {
	userRepo repository.UserRepository
}

// NewUserService は新しいサービスを作成するのだ
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

// GetAllUsers は全ユーザーを取得して、レスポンス用のモデルに変換するのだ
func (s *userService) GetAllUsers() ([]model.UserResponse, error) {
	// 1. リポジトリからDBの生データを取得
	users, err := s.userRepo.FindAll()
	if err != nil {
		return nil, err
	}

	// 2. entityからレスポンス用のmodelに変換（マッピング）する
	//    makeでスライスを初期化すると、データが0件でも空のリスト [] が返るから安全なのだ
	responses := make([]model.UserResponse, 0, len(users))
	for _, user := range users {
		
		var roleName string
		// PreloadしたUserRoleがnilじゃないか、ちゃんとチェックするのだ
		if user.UserRole != nil {
			roleName = user.UserRole.RoleName
		}

		var email string
		// MailAddressもポインタ型(*string)なので、nilチェックするのだ
		if user.MailAddress != nil {
			email = *user.MailAddress
		}

		responses = append(responses, model.UserResponse{
			UserID:   user.UserID,
			UserName: user.UserName,
			Email:    email,
			Role:     roleName,
		})
	}

	return responses, nil
}
