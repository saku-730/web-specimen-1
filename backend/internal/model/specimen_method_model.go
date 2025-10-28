// internal/model/specimen_method.go
package model

// SpecimenMethodResponse は /specimen で返すリストの各要素の型なのだ
type SpecimenMethodResponse struct {
	SpecimenMethodsID     uint   `json:"specimen_methods_id"`
	SpecimenMethodsCommon string `json:"specimen_methods_common"`
	PageID                *uint   `json:"page_id,omitempty"` // NULLの可能性があるのでポインタにするのだ
}
