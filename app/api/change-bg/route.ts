// API route for changing image backgrounds
// 1. Remove background from original image using Remove.bg API
// 2. Generate new background using Pollinations.ai
// 3. Intelligently composite them together
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json()

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      )
    }

    // Step 1: Remove background from the original image using Remove.bg API
    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      throw new Error("REMOVE_BG_API_KEY not configured in .env")
    }

    const base64Image = image.split(",")[1] || image
    
    // Use FormData for Remove.bg API
    const formData = new FormData()
    formData.append("image_file_b64", base64Image)
    formData.append("type", "person")
    formData.append("format", "png")
    formData.append("quality", "premium")
    formData.append("edge", "smooth")

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body: formData,
    })

    let personImage: string

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text()
      console.warn("Remove.bg API warning:", errorText)
      personImage = image // Fallback to original
    } else {
      const personBlob = await removeBgResponse.blob()
      const personArrayBuffer = await personBlob.arrayBuffer()
      const personBase64 = Buffer.from(personArrayBuffer).toString("base64")
      personImage = `data:image/png;base64,${personBase64}`
    }

    // Step 2: Generate new background using Pollinations.ai
    const backgroundUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=768&height=768&nologo=true`

    const backgroundResponse = await fetch(backgroundUrl)
    if (!backgroundResponse.ok) {
      throw new Error(`Failed to generate background: ${backgroundResponse.status}`)
    }

    const bgBlob = await backgroundResponse.blob()
    const bgArrayBuffer = await bgBlob.arrayBuffer()
    const bgBase64 = Buffer.from(bgArrayBuffer).toString("base64")
    const backgroundImage = `data:image/jpeg;base64,${bgBase64}`

    // Step 3: Return both images for frontend intelligent compositing
    return NextResponse.json({
      success: true,
      personWithTransparency: personImage,
      background: backgroundImage,
    })
  } catch (error) {
    console.error("Error changing background:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to change background"
      },
      { status: 500 }
    )
  }
}
