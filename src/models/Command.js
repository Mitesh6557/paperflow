export function createCommand({ execute, undo, label }) {
  return { execute, undo, label };
}

export function addAnnotationCommand(annotationStore, annotation) {
  return createCommand({
    label: `add:${annotation.type}`,
    execute: () => {
      annotationStore.getState()._addInternal(annotation);
      annotationStore.getState().setSelectedAnnotationId(annotation.id);
    },
    undo: () => annotationStore.getState()._removeInternal(annotation.id),
  });
}

export function deleteAnnotationCommand(annotationStore, annotation) {
  return createCommand({
    label: `delete:${annotation.type}`,
    execute: () => annotationStore.getState()._removeInternal(annotation.id),
    undo: () => annotationStore.getState()._addInternal(annotation), // re-add exact same object to restore
  });
}

export function updateAnnotationCommand(annotationStore, id, prevPatch, nextPatch) {
  return createCommand({
    label: `update:${id}`,
    execute: () => annotationStore.getState()._patchInternal(id, nextPatch),
    undo: () => annotationStore.getState()._patchInternal(id, prevPatch),
  });
}
