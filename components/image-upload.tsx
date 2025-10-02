"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  imagePreview: string | null
}

export default function ImageUpload({ onImageSelect, selectedImage, imagePreview }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0])
      }
    },
    [onImageSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const clearImage = () => {
    onImageSelect(null as any)
  }

  if (imagePreview) {
    return (
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden border-2 border-border">
          <img src={imagePreview || "/placeholder.svg"} alt="Selected leaf" className="w-full h-64 object-cover" />
          <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={clearImage}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          {isDragActive ? (
            <Upload className="w-8 h-8 text-primary" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div>
          <p className="text-lg font-medium mb-1">{isDragActive ? "Drop your image here" : "Upload leaf image"}</p>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to select an apple leaf photo</p>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">Supports: JPEG, PNG, WebP • Max size: 10MB</div>
      </div>
    </div>
  )
}
