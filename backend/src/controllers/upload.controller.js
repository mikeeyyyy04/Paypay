import { uploadCourseCover } from "../services/upload.service.js";

export async function uploadClassCover(request, response) {
  const result = await uploadCourseCover(
    request.params.classId,
    request.file
  );

  response.status(200).json(result);
}