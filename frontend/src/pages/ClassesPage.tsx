import { useEffect, useState, type FormEvent } from 'react';
import defaultCourse from '../assets/courses/img1.jpg';
import { emptyClassForm } from '../data/initialData';
import type { ClassFormValues, ClassItem } from '../types';

type ClassesPageProps = {
  classes: ClassItem[];
  loading?: boolean;
  error?: string;
  onSaveClass: (values: ClassFormValues, classId?: string) => Promise<void> | void;
  onDeleteClass: (classId: string) => Promise<void> | void;
  onActivateClass: (classId: string) => Promise<void> | void;
  onArchiveClass: (classId: string) => Promise<void> | void;
};


export function ClassesPage({ classes, loading = false, error = '', onSaveClass, onDeleteClass, onActivateClass, onArchiveClass }: ClassesPageProps) {
  const [formValues, setFormValues] = useState<ClassFormValues>(emptyClassForm);
  const [editingClassId, setEditingClassId] = useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

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

  function openCreateForm() {
    setFormValues(emptyClassForm);
    setEditingClassId(undefined);
    setIsFormOpen(true);
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

  async function changeClassStatus(classItem: ClassItem, status: ClassFormValues['status']) {
    await onSaveClass(
      {
        title: classItem.title,
        category: classItem.category,
        instructor: classItem.instructor,
        schedule: classItem.schedule,
        price: classItem.price,
        capacity: classItem.capacity,
        status,
        description: classItem.description,
        enrolled: classItem.enrolled,
        coverImage: null,
      },
      classItem.id,
    );
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
          <p className="catalog-subtitle">Create new classes, edit the catalog, and remove stale entries.</p>
        </div>
        <button className="button small-button catalog-add-button" type="button" onClick={openCreateForm}>
          Add class
        </button>
      </header>

      {isFormOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={resetForm}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="class-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header modal-header">
              <div>
                <p className="catalog-eyebrow">Class management</p>
                <h3 id="class-modal-title">{editingClass ? 'Edit class' : 'Add class'}</h3>
                <p className="muted">
                  {editingClass ? 'Update the selected class and save the changes.' : 'Fill out the form to create a new class.'}
                </p>
              </div>
              <button className="text-button" type="button" onClick={resetForm} aria-label="Close class form">
                Close
              </button>
            </div>

            <form className="form-grid catalog-form" onSubmit={submitClass}>
              <label>
                Title
                <input
                  value={formValues.title}
                  onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
                            <label>
                Category
                <input
                  value={formValues.category}
                  onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value }))}
                  list="class-categories"
                  required
                />
                <datalist id="class-categories">
                  <option value="Lincoln Douglas" />
                  <option value="Team Policy" />
                  <option value="Speech" />
                  <option value="Parli" />
                  <option value="Debate 101" />
                </datalist>
              </label>
              <label>
                Instructor
                <input
                  value={formValues.instructor}
                  onChange={(event) => setFormValues((current) => ({ ...current, instructor: event.target.value }))}
                  required
                />
              </label>
              <label>
                Schedule
                <input
                  value={formValues.schedule}
                  onChange={(event) => setFormValues((current) => ({ ...current, schedule: event.target.value }))}
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
                  required
                />
              </label>
              <label>
                Capacity
                <input
                  value={formValues.capacity}
                  onChange={(event) => setFormValues((current) => ({ ...current, capacity: Number(event.target.value) }))}
                  type="number"
                  min="1"
                  step="1"
                  required
                />
              </label>
              <label>
                Status
                <select
                  value={formValues.status}
                  onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value as ClassFormValues['status'] }))}
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Full</option>
                  <option>Archived</option>
                </select>
              </label>
              <label>
                Enrolled
                <input
                  value={formValues.enrolled ?? ''}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      enrolled: event.target.value === '' ? undefined : Number(event.target.value),
                    }))
                  }
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional"
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
              <label className="span-full">
                Description
                <textarea
                  value={formValues.description}
                  onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  required
                />
              </label>
              <div className="form-actions span-full">
                <button className="button small-button" type="submit">
                  {isSaving ? 'Saving...' : editingClass ? 'Save changes' : 'Add class'}
                </button>
              </div>
              {actionError ? <p className="error span-full">{actionError}</p> : null}
            </form>
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
                <span className="class-card-price">PHP {classItem.price.toFixed(2)}</span>
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
                {classItem.status === 'Active' ? (
                  <button className="button button-secondary class-card-button" type="button" onClick={() => void changeClassStatus(classItem, 'Draft')}>
                    Unpublish
                  </button>
                ) : (
                  <button className="button button-secondary class-card-button" type="button" onClick={() => void onActivateClass(classItem.id)}>
                    Publish
                  </button>
                )}
                {classItem.status !== 'Archived' ? (
                  <button className="button button-secondary class-card-button" type="button" onClick={() => void onArchiveClass(classItem.id)}>
                    Archive
                  </button>
                ) : null}
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



