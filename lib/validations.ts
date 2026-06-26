import { z } from "zod"
import { COUNTRY_CITIES } from "./countries"

const VALID_COUNTRIES = ["UAE", "India", "Pakistan", "USA", "UK"] as const
const VALID_INTERESTS = ["Technology", "Sports", "Music", "Travel", "Reading", "Gaming"] as const

export const MAX_PHOTO_SIZE = 1_048_576
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"]

export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be 100 characters or fewer."),
    email: z
      .string()
      .min(1, "Email address is required.")
      .email("Please enter a valid email address.")
      .max(254, "Email address must be 254 characters or fewer."),
    mobile: z
      .string()
      .min(1, "Mobile number is required.")
      .regex(/^\d+$/, "Mobile number must contain only digits.")
      .min(10, "Mobile number must be at least 10 digits.")
      .max(15, "Mobile number must be 15 digits or fewer."),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required.")
      .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date.")
      .refine((val) => new Date(val) < new Date(), "Date of birth must be in the past.")
      .refine((val) => {
        const min = new Date()
        min.setFullYear(min.getFullYear() - 13)
        return new Date(val) <= min
      }, "You must be at least 13 years old to register."),
    gender: z
      .string()
      .min(1, "Please select your gender.")
      .refine((v) => ["male", "female", "other"].includes(v), "Please select a valid gender option."),
    interests: z
      .array(z.string())
      .min(1, "Please select at least one interest.")
      .refine(
        (arr) => arr.every((v) => (VALID_INTERESTS as readonly string[]).includes(v)),
        "One or more selected interests are not valid."
      ),
    country: z
      .string()
      .min(1, "Please select your country.")
      .refine((v) => (VALID_COUNTRIES as readonly string[]).includes(v), "Please select a valid country."),
    city: z.string().min(1, "Please select your city."),
  })
  .superRefine((data, ctx) => {
    const validCities = COUNTRY_CITIES[data.country] ?? []
    if (data.city && !validCities.includes(data.city)) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a valid city for the selected country.",
        path: ["city"],
      })
    }
  })

export type RegistrationFormValues = z.infer<typeof registrationSchema>
