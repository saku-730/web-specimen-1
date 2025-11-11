// internal/service/project_service_test.go
package service

import (
	"testing"

	"github.com/saku-730/web-specimen/backend/internal/entity"
	"github.com/saku-730/web-specimen/backend/internal/model"
	"github.com/saku-730/web-specimen/backend/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- 1. 偽物のRepository（モック）を作るのだ ---

// MockProjectRepository は repository.ProjectRepository インターフェースの偽物なのだ
type MockProjectRepository struct {
	mock.Mock
}

// FindAllWithMembers の偽の動きを定義
func (m *MockProjectRepository) FindAllWithMembers() ([]entity.Project, error) {
	args := m.Called()
	return args.Get(0).([]entity.Project), args.Error(1)
}


// --- 2. 実際のテストを書くのだ ---

func TestProjectService_GetAllProjects(t *testing.T) {
	// 1. 偽物のRepository（モック）の準備
	mockRepo := new(MockProjectRepository)
	
	// 偽のDBデータ（Entity）を準備。メンバー情報も含む。
	userID1 := uint(1)
	userID2 := uint(2)
	mockEntities := []entity.Project{
		{
			ProjectID:   1,
			ProjectName: "Test Project",
			ProjectMembers: []entity.ProjectMember{
				{ProjectMemberID: 1, ProjectID: 1, UserID: &userID1},
				{ProjectMemberID: 2, ProjectID: 1, UserID: &userID2},
			},
		},
		{
			ProjectID:   2,
			ProjectName: "Empty Project",
			ProjectMembers: []entity.ProjectMember{}, // メンバーがいないプロジェクト
		},
	}

	// モックに「もしFindAllWithMembersが呼ばれたら、この偽entityを返してね」と教え込む
	mockRepo.On("FindAllWithMembers").Return(mockEntities, nil)

	// 2. サービスの作成（本物のサービスに、偽物のリポジトリを注入する！）
	service := NewProjectService(mockRepo)

	// 3. テスト実行！サービスを叩く
	results, err := service.GetAllProjects()

	// 4. 結果の検証（アサーション）
	// エラーは起きていないか？
	assert.NoError(t, err)
	// 結果の件数は合っているか？
	assert.Len(t, results, 2)
	
	// 1件目のデータの変換（マッピング）は正しく行われたか？
	assert.Equal(t, uint(1), results[0].ProjectID)
	assert.Equal(t, "Test Project", results[0].ProjectName)
	// ⭐️ ここが一番大事！ メンバーIDのリストが正しく抽出されたか？
	assert.Equal(t, []uint{1, 2}, results[0].ProjectMember)

	// 2件目のデータの変換は正しく行われたか？
	assert.Equal(t, uint(2), results[1].ProjectID)
	assert.Equal(t, "Empty Project", results[1].ProjectName)
	// メンバーがいない場合、空のリスト [] になっているか？
	assert.Equal(t, []uint{}, results[1].ProjectMember)
	
	// モック（偽Repo）は、ちゃんと期待通りに呼ばれたか？
	mockRepo.AssertExpectations(t)
}
