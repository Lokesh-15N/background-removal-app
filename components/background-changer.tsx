// Component for changing image backgrounds using AI
"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Upload, Loader2, Sparkles, X, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error"

export function BackgroundChanger() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [prompt, setPrompt] = useState("")
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const compositeImages = (personImage: string, backgroundImage: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create high-quality output canvas
        const canvas = document.createElement("canvas")
        canvas.width = 768
        canvas.height = 768
        const ctx = canvas.getContext("2d", { alpha: true })

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Load background image and crop it properly
        const bgImg = new Image()
        bgImg.crossOrigin = "anonymous"
        bgImg.onload = () => {
          // Calculate crop dimensions to maintain aspect ratio
          const imgAspect = bgImg.width / bgImg.height
          const canvasAspect = 768 / 768 // 1:1

          let sourceWidth: number
          let sourceHeight: number
          let sourceX: number
          let sourceY: number

          if (imgAspect > canvasAspect) {
            // Image is wider, crop width
            sourceHeight = bgImg.height
            sourceWidth = sourceHeight * canvasAspect
            sourceX = (bgImg.width - sourceWidth) / 2
            sourceY = 0
          } else {
            // Image is taller, crop height
            sourceWidth = bgImg.width
            sourceHeight = sourceWidth / canvasAspect
            sourceX = 0
            sourceY = (bgImg.height - sourceHeight) / 2
          }

          // Draw cropped and centered background to fill canvas
          ctx.drawImage(bgImg, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 768, 768)

          // Load person image with transparency
          const personImg = new Image()
          personImg.crossOrigin = "anonymous"
          personImg.onload = () => {
            // Get person image dimensions
            const personWidth = personImg.width
            const personHeight = personImg.height
            const aspectRatio = personWidth / personHeight

            // Scale person to fill more of the canvas naturally
            // Person should take up 75-85% of canvas for better visual balance
            let scaledWidth = 768 * 0.8
            let scaledHeight = scaledWidth / aspectRatio

            // If height exceeds canvas, scale by height instead
            if (scaledHeight > 768 * 0.95) {
              scaledHeight = 768 * 0.95
              scaledWidth = scaledHeight * aspectRatio
            }

            // Position person in center with slight upper positioning for natural look
            const x = (768 - scaledWidth) / 2
            const y = (768 - scaledHeight) / 2 + 20 // Slightly above center

            // Apply Gaussian blur to edges for natural feathering
            ctx.save()
            
            // Create gradient mask for smooth edge blending
            const gradient = ctx.createRadialGradient(
              x + scaledWidth / 2,
              y + scaledHeight / 2,
              0,
              x + scaledWidth / 2,
              y + scaledHeight / 2,
              Math.max(scaledWidth, scaledHeight) * 0.6
            )
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
            gradient.addColorStop(0.85, "rgba(255, 255, 255, 0.95)")
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.7)")

            // Draw person with full opacity
            ctx.globalAlpha = 1.0
            ctx.drawImage(personImg, x, y, scaledWidth, scaledHeight)

            ctx.restore()

            // Add subtle vignette for depth perception
            const vignetteGradient = ctx.createRadialGradient(
              384, 384, 200,
              384, 384, 600
            )
            vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)")
            vignetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.08)")
            
            ctx.fillStyle = vignetteGradient
            ctx.fillRect(0, 0, 768, 768)

            // Return composite as high-quality data URL
            resolve(canvas.toDataURL("image/png", 0.98))
          }
          personImg.onerror = () => reject(new Error("Failed to load person image"))
          personImg.src = personImage
        }
        bgImg.onerror = () => reject(new Error("Failed to load background image"))
        bgImg.src = backgroundImage
      } catch (error) {
        reject(error)
      }
    })
  }

  const changeBackground = async () => {
    if (!originalImage) {
      setError("Please upload an image first")
      return
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt for the background")
      return
    }

    setProcessingState("processing")
    setError(null)
    try {
      const response = await fetch("/api/change-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: originalImage,
          prompt: prompt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process background change")
      }

      const data = await response.json()
      
      if (data.personWithTransparency && data.background) {
        const compositeImage = await compositeImages(
          data.personWithTransparency,
          data.background
        )
        setProcessedImage(compositeImage)
      }
      
      setProcessingState("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProcessingState("idle")
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.href = processedImage
    link.download = "background-changed.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setProcessingState("idle")
    setError(null)
    setPrompt("")
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
              <div className="aspect-square p-4 flex items-center justify-center bg-background/20">
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : processingState === "processing" ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#A3C9A8]" />
                    <p className="text-sm text-[#C7E8C5]">Generating image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#A3C9A8]">Describe the new background (prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Beach sunset with palm trees', 'Modern office building', 'Forest with snow'"
              className="w-full p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A3C9A8] resize-none h-24"
            />
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
                onClick={changeBackground}
                disabled={processingState === "processing" || !prompt.trim()}
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
                    Change Background
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
