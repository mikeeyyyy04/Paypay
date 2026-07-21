import { useEffect, useMemo, useState, type FormEvent } from 'react';
import defaultCourse from '../assets/courses/img1.jpg';
import { emptyClassForm } from '../data/initialData';
import type { ClassFormValues, ClassItem } from '../types';

type ClassesPageProps = {
  classes: ClassItem[];
  loading?: boolean;
  error?: string;
  onSaveClass: (values: ClassFormValues, classId?: string) => Promise<void> | void;
  onDeleteClass: (classId: string) => Promise<void> | void;
};

export function ClassesPage({ classes, loading = false, error = '', onSaveClass, onDeleteClass }: ClassesPageProps) {
  const [formValues, setFormValues] = useState<ClassFormValues>(emptyClassForm);
  const [editingClassId, setEditingClassId] = useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const previewImageUrl = useMemo(() => {
    if (formValues.coverImage instanceof File) {
      return URL.createObjectURL(formValues.coverImage);
    }
    return defaultCourse;
  }, [formValues.coverImage]);

  useEffect(() => {
    let revokeUrl: string | undefined;

    if (formValues.coverImage instanceof File) {
      revokeUrl = previewImageUrl;
    }

    return () => {
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
    };
  }, [previewImageUrl, formValues.coverImage]);

  const editingClass = classes.find((classItem) => classItem.id === editingClassId);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFormOpen(false);
        setEditingClassId(undefined);
        setFormValues(emptyClassForm);
      }
    }

    if (isFormOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen]);

  function resetForm() {
    setFormValues(emptyClassForm);
    setEditingClassId(undefined);
    setIsFormOpen(false);
  }

  function startEditing(classItem: ClassItem) {
    setEditingClassId(classItem.id);
    setFormValues({
      title: classItem.title,
      category: classItem.category,
      instructor: classItem.instructor,
      schedule: classItem.schedule,
      price: classItem.price,
      capacity: classItem.capacity,
      status: classItem.status,
      description: classItem.description,
      enrolled: classItem.enrolled,
    });
    setIsFormOpen(true);
  }

  async function submitClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setActionError('');

    try {
      await onSaveClass(formValues, editingClassId);
      resetForm();
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Failed to save class.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="catalog-page" aria-label="Class catalog">
      <header className="catalog-header catalog-header-admin">
        <div>
          <p className="catalog-eyebrow">Class management</p>
          <h2>Classes</h2>
          <p className="catalog-subtitle">Edit existing classes in the catalog and remove stale entries.</p>
        </div>
      </header>

      {isFormOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={resetForm}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="class-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header modal-header">
              <div>
                <p className="catalog-eyebrow">Class management</p>
                <h3 id="class-modal-title">Edit class</h3>
                <p className="muted">Update the selected class and save the changes.</p>
              </div>
              <button className="text-button" type="button" onClick={resetForm} aria-label="Close class form">
                Close
              </button>
            </div>

            <form className="form-grid catalog-form" onSubmit={submitClass}>
              <div className="edit-summary span-full">
                <h4>{editingClass?.title || 'Selected class'}</h4>
                <p className="muted">Instructor: {editingClass?.instructor || '—'}</p>
                <p className="muted">
                  Registered: {editingClass?.enrolled ?? 0}/{editingClass?.capacity ?? 0}
                </p>
              </div>

              <label>
                Dates & Times
                <input
                  value={formValues.schedule}
                  onChange={(event) => setFormValues((current) => ({ ...current, schedule: event.target.value }))}
                  placeholder="DATES & TIMES: MONDAYS 5:00PM-6:00PM* PACIFIC TIME"
                  required
                />
              </label>
              <label>
                Price
                <input
                  value={formValues.price}
                  onChange={(event) => setFormValues((current) => ({ ...current, price: Number(event.target.value) }))}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="199"
                  required
                />
              </label>
              <label className="span-full">
                Cover Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      coverImage: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
              <div className="form-actions span-full">
                <button className="button small-button" type="submit">
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
              {actionError ? <p className="error span-full">{actionError}</p> : null}
            </form>

            <div className="preview-panel">
              <p className="catalog-eyebrow">Preview</p>
              <article className="class-product class-product-admin">
                <div className="class-cover-frame">
                  <img src={previewImageUrl} alt={formValues.title || 'Course preview'} />
                </div>
                <div className="class-card-topline">
                  <span className="class-card-category">{formValues.category || 'Debate'}</span>
                  <span className="class-card-price">USD {(formValues.price || 199).toFixed(2)}</span>
                </div>
                <h2>{formValues.title || 'Ultimate LD Debate Class'}</h2>
                <p className="class-card-description">
                  {formValues.description || 'This class will focus on how to become a top Lincoln Douglas debater and improve your LD debate skills.'}
                </p>
                <div className="class-card-meta">
                  <div>
                    <span className="class-card-label">Instructor</span>
                    <strong>{formValues.instructor || 'Griffith Vertican'}</strong>
                  </div>
                  <div>
                    <span className="class-card-label">Schedule</span>
                    <strong>{formValues.schedule || 'DATES & TIMES: MONDAYS 5:00PM-6:00PM* PACIFIC TIME'}</strong>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? <p className="muted catalog-subtitle">Loading classes from database...</p> : null}
      {error ? <p className="error catalog-subtitle">{error}</p> : null}

      <div className="class-catalog-grid">
        {classes.map((classItem) => (
            <article className="class-product class-product-admin" key={classItem.id}>
              <div className="class-cover-frame">
                <img src={classItem.coverImage ?? defaultCourse} alt={classItem.title} />
              </div>
              <div className="class-card-topline">
                <span className="class-card-category">{classItem.category}</span>
                <span className="class-card-price">USD {classItem.price.toFixed(2)}</span>
              </div>
              <h2>{classItem.title}</h2>
              <p className="class-card-description">{classItem.description}</p>
              <div className="class-card-meta">
                <div>
                  <span className="class-card-label">Instructor</span>
                  <strong>{classItem.instructor}</strong>
                </div>
                <div>
                  <span className="class-card-label">Schedule</span>
                  <strong>{classItem.schedule}</strong>
                </div>
                <div>
                  <span className="class-card-label">Enrollment</span>
                  <strong>
                    {classItem.enrolled}/{classItem.capacity}
                  </strong>
                </div>
                <div>
                  <span className="class-card-label">Status</span>
                  <strong>{classItem.status}</strong>
                </div>
              </div>
              <div className="class-card-actions">
                <button className="button button-secondary class-card-button" type="button" onClick={() => startEditing(classItem)}>
                  Edit
                </button>
                <button
                  className="button button-danger class-card-button"
                  type="button"
                  onClick={() => {
                    const shouldDelete = window.confirm(`Delete ${classItem.title}?`);
                    if (shouldDelete) {
                      void onDeleteClass(classItem.id);
                      if (editingClassId === classItem.id) {
                        resetForm();
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
        ))}
      </div>
    </section>
  );
}




