// React component for background removal UI and logic
"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, Download, Loader2, ImageIcon, Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error"

export function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setError(null)
    setProcessedImage(null)
    setProcessingState("uploading")

    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setProcessingState("idle")
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const removeBackground = async () => {
    if (!originalImage) return

    setProcessingState("processing")
    setError(null)

    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append("image", blob, "image.png")

      const result = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      })

      if (!result.ok) {
        const errorData = await result.json()
        throw new Error(errorData.error || "Failed to remove background")
      }

      const processedBlob = await result.blob()
      const processedUrl = URL.createObjectURL(processedBlob)
      setProcessedImage(processedUrl)
      setProcessingState("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProcessingState("error")
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.href = processedImage
    link.download = "background-removed.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setProcessingState("idle")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-24">
      {!originalImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300",
            "bg-transparent w-[28rem] h-52 md:w-[40rem] md:h-60 flex flex-col justify-center items-center mx-auto",
            isDragOver
              ? "border-[#A3C9A8]/60 bg-[#A3C9A8]/5 scale-[1.02]"
              : "border-[#A3C9A8]/10 hover:border-[#A3C9A8]/30 hover:bg-[#A3C9A8]/5",
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A3C9A8]/30 to-[#C7E8C5]/30 flex items-center justify-center shadow-[0_0_16px_2px_#A3C9A8]">
              <Upload className="w-7 h-7 text-[#A3C9A8] drop-shadow-[0_0_6px_#A3C9A8]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#A3C9A8] mb-2">Drop your image here</h3>
              <p className="text-[#C7E8C5]">or click to browse • PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="relative rounded-2xl overflow-hidden bg-card/40 backdrop-blur-xl border border-border">
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-sm font-medium text-foreground">
                Original
              </div>
              <button
                onClick={reset}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-destructive/20 transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
              <div className="aspect-square p-4 flex items-center justify-center">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Processed Image */}
            <div className="relative rounded-2xl overflow-hidden bg-card/40 backdrop-blur-xl border border-border">
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-sm font-medium text-foreground">
                Result
              </div>
              <div
                className="aspect-square p-4 flex items-center justify-center"
                style={{
                  backgroundImage: processedImage ? "repeating-conic-gradient(#2a2a3a 0% 25%, #1a1a2a 0% 50%)" : "none",
                  backgroundSize: "20px 20px",
                }}
              >
                {processedImage ? (
                  <img
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ImageIcon className="w-16 h-16 opacity-30" />
                    <p className="text-sm">Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {processingState !== "complete" && (
              <Button
                onClick={removeBackground}
                disabled={processingState === "processing"}
                size="lg"
                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] hover:opacity-90 transition-opacity text-[#23422a] font-semibold shadow-lg border-0"
              >
                {processingState === "processing" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Remove Background
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}

            {processedImage && (
              <Button onClick={downloadImage} size="lg" className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] hover:opacity-90 transition-opacity text-[#23422a] font-semibold shadow-lg border-0">
                <Download className="w-5 h-5 mr-2" />
                Download PNG
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
