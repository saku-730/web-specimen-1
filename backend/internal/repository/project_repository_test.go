// internal/repository/project_repository_test.go
package repository

import (
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/saku-730/web-specimen/backend/internal/entity"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestProjectRepository_FindAllWithMembers(t *testing.T) {
	// 1. 偽物のSQLデータベース(db)と、その動きを操る(mock)を準備
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	// 2. 偽物のSQL(db)に接続する、偽物のGORM(gormDB)を準備
	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	assert.NoError(t, err)

	// 3. 偽物のGORM(gormDB)を本物のリポジトリに注入
	repo := NewProjectRepository(gormDB)

	// 4. GORMが発行する「はず」のSQL文を定義する
	//    FindAllWithMembers は Preload("ProjectMembers") をするので、クエリは2回飛ぶはずなのだ
	
	// 1回目のクエリ：projectsテーブルから全件取得
	expectedSQLProjects := `SELECT * FROM "projects"`
	// このクエリが来たら、この行(rows)を返してね、という準備
	rowsProjects := sqlmock.NewRows([]string{"project_id", "project_name"}).
		AddRow(1, "Project A").
		AddRow(2, "Project B")

	// 2回目のクエリ：ProjectMembersのPreload
	expectedSQLMembers := `SELECT * FROM "project_members" WHERE "project_members"."project_id" IN ($1,$2)`
	// このクエリが来たら、この行を返してね、という準備 (Project Aのメンバーだけ)
	rowsMembers := sqlmock.NewRows([]string{"project_member_id", "project_id", "user_id"}).
		AddRow(100, 1, 1).
		AddRow(101, 1, 2)

	// 5. モックに「こういうクエリが来たら、こう返してね」と教え込む
	mock.ExpectQuery(regexp.QuoteMeta(expectedSQLProjects)).WillReturnRows(rowsProjects)
	mock.ExpectQuery(regexp.QuoteMeta(expectedSQLMembers)).WithArgs(1, 2).WillReturnRows(rowsMembers)

	// 6. テスト実行！リポジトリを叩く
	projects, err := repo.FindAllWithMembers()

	// 7. 結果の検証（アサーション）
	assert.NoError(t, err)
	assert.Len(t, projects, 2)
	// Project A のPreloadが成功したか
	assert.Equal(t, "Project A", projects[0].ProjectName)
	assert.Len(t, projects[0].ProjectMembers, 2)
	assert.Equal(t, uint(2), *projects[0].ProjectMembers[1].UserID)
	// Project B のPreloadが成功したか (0件)
	assert.Equal(t, "Project B", projects[1].ProjectName)
	assert.Len(t, projects[1].ProjectMembers, 0) // 該当なし

	// 8. 全ての期待（ExpectQuery）がちゃんと実行されたか確認
	assert.NoError(t, mock.ExpectationsWereMet())
}
