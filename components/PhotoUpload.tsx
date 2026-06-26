"use client"

import { useRef, useState, DragEvent, ChangeEvent } from "react"
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE } from "@/lib/validations"

interface PhotoUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  error?: string
  disabled?: boolean
}

function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`
}

export default function PhotoUpload({ value, onChange, error, disabled }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const accept = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onChange(file)
  }

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const tryFile = (file: File | undefined) => {
    if (!file) return
    if (!ALLOWED_PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_SIZE) {
      onChange(null)
      return
    }
    accept(file)
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => tryFile(e.target.files?.[0])

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    tryFile(e.dataTransfer.files[0])
  }

  const zoneBase = "w-full rounded-lg border-2 border-dashed p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
  const zoneDefault = "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
  const zoneError = "border-red-500 bg-red-50 border-solid"
  const zoneSuccess = "border-green-400 bg-green-50 border-solid"
  const zoneDrag = "border-blue-400 bg-blue-50"

  let zoneStyle = zoneDefault
  if (error) zoneStyle = zoneError
  else if (value) zoneStyle = zoneSuccess
  else if (dragOver) zoneStyle = zoneDrag

  return (
    <div>
      <div
        className={`${zoneBase} ${zoneStyle} ${disabled ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG — max 1 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
          id="photo"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}

      {value && !error && previewUrl && (
        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-md border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{value.name}</p>
            <p className="text-xs text-gray-500">{formatSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clear() }}
            className="text-red-500 text-sm underline cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
