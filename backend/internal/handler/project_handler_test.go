// internal/handler/project_handler_test.go
package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/saku-730/web-specimen/backend/internal/model"
	"github.com/saku-730/web-specimen/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockProjectService は service.ProjectService インターフェースの偽物なのだ
type MockProjectService struct {
	mock.Mock
}

// GetAllProjects の偽の動きを定義する
func (m *MockProjectService) GetAllProjects() ([]model.ProjectResponse, error) {
	args := m.Called()
	return args.Get(0).([]model.ProjectResponse), args.Error(1)
}

// --- 2. 実際のテストを書くのだ ---

func TestProjectHandler_GetAll(t *testing.T) {
	// 1. セットアップ：Ginをテストモードにして、偽物のHTTPリクエスト環境を作る
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder() // レスポンスを受け取る「偽のブラウザ」
	c, _ := gin.CreateTestContext(w) // 偽のGinコンテキスト

	// 2. 偽物のService（モック）の準備
	mockService := new(MockProjectService)
	
	// 偽のレスポンスデータ（Serviceが返すべきデータ）を準備
	mockResponse := []model.ProjectResponse{
		{
			ProjectID:     1,
			ProjectName:   "Test Project",
			Description:   nil,
			StartDate:     nil,
			FinishedDate:  nil,
			Note:          nil,
			ProjectMember: []uint{1, 2},
		},
		{
			ProjectID:     2,
			ProjectName:   "Test Project2",
			Description:   nil,
			StartDate:     nil,
			FinishedDate:  nil,
			Note:          nil,
			ProjectMember: []uint{1, 2,3,4,5},
		},

	}

	// モックに「もしGetAllProjectsが呼ばれたら、この偽データを返してね」と教え込む
	mockService.On("GetAllProjects").Return(mockResponse, nil)

	// 3. ハンドラの作成（本物のハンドラに、偽物のサービスを注入する！）
	handler := NewProjectHandler(mockService)

	// 4. テスト実行！ハンドラを叩く
	handler.GetAll(c)

	// 5. 結果の検証（アサーション）
	// ステータスコードは200 OKだったか？
	assert.Equal(t, http.StatusOK, w.Code)
	
	// 返ってきたJSONの中身は、期待通りか？
	var actualResponse []model.ProjectResponse
	json.Unmarshal(w.Body.Bytes(), &actualResponse)
	assert.Equal(t, mockResponse, actualResponse)
	
	// モック（偽Service）は、ちゃんと期待通りに呼ばれたか？
	mockService.AssertExpectations(t)
}
