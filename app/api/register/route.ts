import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { registrationSchema, ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE } from "@/lib/validations"
import { insertRegistration, emailExists } from "@/db/queries"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { success: false, errors: { _form: "Invalid request format." } },
      { status: 400 }
    )
  }

  const rawInterests = formData.getAll("interests") as string[]
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    mobile: formData.get("mobile") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    gender: formData.get("gender") as string,
    interests: rawInterests,
    country: formData.get("country") as string,
    city: formData.get("city") as string,
  }

  const parsed = registrationSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const errors: Record<string, string> = {}
    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) errors[key] = messages[0]
    }
    return NextResponse.json({ success: false, errors }, { status: 422 })
  }

  const photo = formData.get("photo")
  if (!photo || !(photo instanceof Blob)) {
    return NextResponse.json(
      { success: false, errors: { photo: "Please upload a profile photo." } },
      { status: 422 }
    )
  }

  if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    return NextResponse.json(
      { success: false, errors: { photo: "Only JPG and PNG files are accepted." } },
      { status: 422 }
    )
  }

  if (photo.size > MAX_PHOTO_SIZE) {
    return NextResponse.json(
      { success: false, errors: { photo: "Photo must be smaller than 1 MB." } },
      { status: 422 }
    )
  }

  try {
    const duplicate = await emailExists(parsed.data.email)
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_EMAIL", message: "An account with this email already exists." } },
        { status: 409 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, errors: { _form: "Something went wrong. Please try again." } },
      { status: 500 }
    )
  }

  let photoUrl: string
  let publicId: string | undefined
  try {
    const buffer = Buffer.from(await photo.arrayBuffer())
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "registration-form", resource_type: "image" }, (err, result) => {
          if (err || !result) reject(err)
          else resolve(result as { secure_url: string; public_id: string })
        })
        .end(buffer)
    })
    photoUrl = uploadResult.secure_url
    publicId = uploadResult.public_id
  } catch {
    return NextResponse.json(
      { success: false, errors: { _form: "Photo upload failed. Please try again." } },
      { status: 502 }
    )
  }

  try {
    const row = await insertRegistration({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      mobile: parsed.data.mobile,
      dateOfBirth: parsed.data.dateOfBirth,
      gender: parsed.data.gender,
      interests: parsed.data.interests,
      country: parsed.data.country,
      city: parsed.data.city,
      photoUrl,
    })
    return NextResponse.json({ success: true, id: row.id }, { status: 201 })
  } catch (err: unknown) {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {})
    }
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_EMAIL", message: "An account with this email already exists." } },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, errors: { _form: "Something went wrong. Please try again." } },
      { status: 502 }
    )
  }
}
