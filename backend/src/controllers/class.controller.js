import {
  createClass as createClassRecord,
  deleteClass as deleteClassRecord,
  findAdminClasses,
  findPublicClasses,
  sanitizeClass,
  updateClass as updateClassRecord,
  validateClassPayload,
} from '../services/class.service.js';

export async function listPublicClasses(request, response) {
  const classes = await findPublicClasses();
  response.status(200).json({ classes: classes.map((classItem) => sanitizeClass(classItem)) });
}

export async function listAdminClasses(request, response) {
  const classes = await findAdminClasses();
  response.status(200).json({ classes: classes.map((classItem) => sanitizeClass(classItem)) });
}

export async function createClass(request, response) {
  const validation = validateClassPayload(request.body);

  if (validation.error) {
    response.status(400).json({ message: validation.error });
    return;
  }

  const classItem = await createClassRecord(validation.values);
  response.status(201).json({ classItem: sanitizeClass(classItem) });
}

export async function updateClass(request, response) {
  const validation = validateClassPayload(request.body);

  if (validation.error) {
    response.status(400).json({ message: validation.error });
    return;
  }

  const classItem = await updateClassRecord(request.params.classId, validation.values);
  response.status(200).json({ classItem: sanitizeClass(classItem) });
}

export async function deleteClass(request, response) {
  await deleteClassRecord(request.params.classId);
  response.sendStatus(204);
}
