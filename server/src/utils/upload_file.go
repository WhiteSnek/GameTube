package utils

import (
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
)

// UploadFile saves the uploaded file to a destination folder and returns the file path.
func UploadFile(file multipart.File, filename string) (string, error) {
	// Create a new file in the destination folder
	dstPath := filepath.Join("../uploads")
	dst, err := os.Create(dstPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy the contents of the uploaded file to the new file
	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	// Return the file path
	return dstPath, nil
}
