import {
  createClass as createClassRecord,
  deleteClass as deleteClassRecord,
  findAdminClasses,
  findPublicClassBySlug,
  findPublicClasses,
  sanitizeClass,
  updateClass as updateClassRecord,
  validateClassPayload,
} from '../services/class.service.js';

export async function listPublicClasses(request, response) {
  const classes = await findPublicClasses();
  response.status(200).json({ classes: classes.map((classItem) => sanitizeClass(classItem)) });
}

export async function getPublicClass(request, response) {
  const classItem = await findPublicClassBySlug(request.params.slug);

  if (!classItem) {
    response.status(404).json({ message: 'Class not found.' });
    return;
  }

  response.status(200).json({ classItem: sanitizeClass(classItem) });
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
  const classItem = await deleteClassRecord(request.params.classId);

  if (classItem) {
    response.status(200).json({ deleted: false, classItem: sanitizeClass(classItem) });
    return;
  }

  response.sendStatus(204);
}

