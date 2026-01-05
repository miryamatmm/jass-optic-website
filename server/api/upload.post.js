import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  const formData = await readMultipartFormData(event)
  if (!formData) return { error: "No file received" }

  const file = formData.find(f => f.name === "file")
  const type = formData.find(f => f.name === "type")?.data?.toString()

  if (!file || !type) {
    return { error: "Missing file or type" }
  }

  const filePath = `${type}/${Date.now()}-${file.filename}`

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error(error)
    return { error: "Upload failed" }
  }

  // URL accessible publiquement
  const publicUrl = `${config.supabaseUrl}/storage/v1/object/public/uploads/${filePath}`

  return { url: publicUrl }
})
