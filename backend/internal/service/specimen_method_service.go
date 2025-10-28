// internal/service/specimen_method_service.go
package service

import (
	"github.com/saku-730/web-specimen/backend/internal/model"
	"github.com/saku-730/web-specimen/backend/internal/repository"
)

type SpecimenMethodService interface {
	GetAllSpecimenMethods() ([]model.SpecimenMethodResponse, error)
}

type specimenMethodService struct {
	repo repository.SpecimenMethodRepository
}

func NewSpecimenMethodService(repo repository.SpecimenMethodRepository) SpecimenMethodService {
	return &specimenMethodService{repo: repo}
}

func (s *specimenMethodService) GetAllSpecimenMethods() ([]model.SpecimenMethodResponse, error) {
	entities, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	responses := make([]model.SpecimenMethodResponse, 0, len(entities))
	for _, entity := range entities {
		
		// entity.MethodCommonName は *string なので、nilチェック
		var commonName string
		if entity.MethodCommonName != nil {
			commonName = *entity.MethodCommonName
		}

		responses = append(responses, model.SpecimenMethodResponse{
			SpecimenMethodsID:     entity.SpecimenMethodsID,
			SpecimenMethodsCommon: commonName,
			PageID:                entity.PageID,
		})
	}

	return responses, nil
}
