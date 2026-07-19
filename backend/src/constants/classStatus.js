export const CLASS_STATUS_TO_API = {
  DRAFT: 'Draft',
  PUBLISHED: 'Active',
  FULL: 'Full',
  ARCHIVED: 'Archived',
  CANCELLED: 'Archived',
};

export const CLASS_STATUS_TO_DATABASE = {
  Draft: 'DRAFT',
  Active: 'PUBLISHED',
  Full: 'FULL',
  Archived: 'ARCHIVED',
};

export const PUBLIC_CLASS_STATUSES = ['PUBLISHED', 'FULL'];
export const API_CLASS_STATUSES = Object.keys(CLASS_STATUS_TO_DATABASE);
