import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as Blob | null

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Remove.bg API key not configured. Please add REMOVE_BG_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const removeBgFormData = new FormData()
    removeBgFormData.append("image_file", imageFile)
    removeBgFormData.append("size", "auto")

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Failed to process image"

      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.errors?.[0]?.title || errorMessage
      } catch {
        // Use default error message
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const resultBuffer = await response.arrayBuffer()

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=background-removed.png",
      },
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
