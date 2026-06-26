"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { registrationSchema, type RegistrationFormValues } from "@/lib/validations"
import { COUNTRIES, COUNTRY_CITIES } from "@/lib/countries"
import FormField from "./FormField"
import TextInput from "./TextInput"
import RadioGroup from "./RadioGroup"
import CheckboxGroup from "./CheckboxGroup"
import SelectInput from "./SelectInput"
import PhotoUpload from "./PhotoUpload"
import SubmitButton from "./SubmitButton"
import ErrorBanner from "./ErrorBanner"

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
]

const INTEREST_OPTIONS = ["Technology", "Sports", "Music", "Travel", "Reading", "Gaming"]

export default function RegistrationForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      dateOfBirth: "",
      gender: undefined,
      interests: [],
      country: undefined,
      city: "",
    },
  })

  const selectedCountry = watch("country")
  const cityOptions = selectedCountry ? COUNTRY_CITIES[selectedCountry] ?? [] : []

  const clearServerError = () => setServerError(null)

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!photo) {
      setPhotoError("Please upload a profile photo.")
      return
    }

    const allowed = ["image/jpeg", "image/png"]
    if (!allowed.includes(photo.type)) {
      setPhotoError("Only JPG and PNG files are accepted.")
      return
    }
    if (photo.size > 1_048_576) {
      setPhotoError("Photo must be smaller than 1 MB.")
      return
    }

    setPhotoError(null)
    setServerError(null)

    const formData = new FormData()
    formData.append("fullName", data.fullName)
    formData.append("email", data.email)
    formData.append("mobile", data.mobile)
    formData.append("dateOfBirth", data.dateOfBirth)
    formData.append("gender", data.gender)
    data.interests.forEach((i) => formData.append("interests", i))
    formData.append("country", data.country)
    formData.append("city", data.city)
    formData.append("photo", photo)

    const res = await fetch("/api/register", { method: "POST", body: formData })
    const json = await res.json()

    if (!res.ok) {
      if (res.status === 409) {
        setServerError("An account with this email address already exists. Please use a different email.")
        return
      }
      if (json.errors) {
        Object.entries(json.errors as Record<string, string>).forEach(([field, message]) => {
          if (field === "_form") {
            setServerError(message)
          } else if (field === "photo") {
            setPhotoError(message)
          } else {
            setError(field as keyof RegistrationFormValues, { type: "server", message })
          }
        })
      } else {
        setServerError("Something went wrong. Please try again in a moment.")
      }
      return
    }

    router.push(`/thank-you?name=${encodeURIComponent(data.fullName)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center">Create Your Account</h1>
        <p className="text-sm text-gray-600 text-center mt-2 mb-8">
          Please fill in all fields below to complete your registration.
        </p>

        <ErrorBanner message={serverError} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Full Name" htmlFor="full_name" error={errors.fullName?.message} required>
            <TextInput
              id="full_name"
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              error={!!errors.fullName}
              {...register("fullName", { onChange: clearServerError })}
            />
          </FormField>

          <FormField label="Email Address" htmlFor="email" error={errors.email?.message} required>
            <TextInput
              id="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              inputMode="email"
              error={!!errors.email}
              {...register("email", { onChange: clearServerError })}
            />
          </FormField>

          <FormField label="Mobile Number" htmlFor="mobile" error={errors.mobile?.message} required>
            <TextInput
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number (digits only)"
              autoComplete="tel"
              inputMode="tel"
              error={!!errors.mobile}
              {...register("mobile", { onChange: clearServerError })}
            />
          </FormField>

          <FormField label="Date of Birth" htmlFor="date_of_birth" error={errors.dateOfBirth?.message} required>
            <TextInput
              id="date_of_birth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={!!errors.dateOfBirth}
              {...register("dateOfBirth", { onChange: clearServerError })}
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message} required>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  name="gender"
                  options={GENDER_OPTIONS}
                  value={field.value ?? ""}
                  onChange={(val) => { field.onChange(val); clearServerError() }}
                  error={errors.gender?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Interests" htmlFor="interests" error={errors.interests?.message} required>
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  name="interests"
                  options={INTEREST_OPTIONS}
                  value={field.value}
                  onChange={(val) => { field.onChange(val); clearServerError() }}
                  error={errors.interests?.message}
                />
              )}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Country" htmlFor="country" error={errors.country?.message} required>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    id="country"
                    placeholder="-- Select a country --"
                    options={COUNTRIES}
                    value={field.value ?? ""}
                    onChange={(e) => { field.onChange(e.target.value); clearServerError() }}
                    error={!!errors.country}
                  />
                )}
              />
            </FormField>

            <FormField label="City" htmlFor="city" error={errors.city?.message} required>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    id="city"
                    placeholder="-- Select a city --"
                    options={cityOptions}
                    value={field.value ?? ""}
                    onChange={(e) => { field.onChange(e.target.value); clearServerError() }}
                    disabled={!selectedCountry}
                    error={!!errors.city}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField label="Profile Photo" htmlFor="photo" error={photoError ?? undefined} required>
            <PhotoUpload
              value={photo}
              onChange={(file) => {
                setPhoto(file)
                setPhotoError(null)
                clearServerError()
              }}
              error={photoError ?? undefined}
              disabled={isSubmitting}
            />
          </FormField>

          <div className="flex justify-end mt-6">
            <SubmitButton isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  )
}
