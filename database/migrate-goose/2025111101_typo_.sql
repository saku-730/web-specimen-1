-- +goose Up

ALTER TABLE projects ReNAME COLUMN disscription TO description;

-- +goose Down
