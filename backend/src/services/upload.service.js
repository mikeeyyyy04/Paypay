import { randomUUID } from "crypto";
import { prisma } from "../database/prisma.js";
import { supabase } from "../lib/supabase.js";

const BUCKET = "course-images";

export async function uploadCourseCover(classId, file) {
  if (!file) {
    throw new Error("No image uploaded.");
  }

  const extension = file.originalname.split(".").pop();
  const filename = `${classId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  await prisma.class.update({
    where: {
      id: classId,
    },
    data: {
      coverImageUrl: data.publicUrl,
    },
  });

  return {
    coverImageUrl: data.publicUrl,
  };
}