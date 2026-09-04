/**
 * Change-detection is isolated here so a future native rhwp dirty/change API
 * can replace this estimator without touching feature code.
 *
 * @rhwp/editor 0.8.4 has no onChange or isDirty(). iframe pointerdown/focus
 * only means the user interacted with the editor, not that the document changed.
 */
export function attachPossiblyModifiedEstimator(
  iframe: HTMLIFrameElement,
  onPossiblyModified: () => void,
): () => void {
  const notify = () => {
    onPossiblyModified()
  }

  iframe.addEventListener('pointerdown', notify)
  iframe.addEventListener('focus', notify)
  iframe.addEventListener('focusin', notify)

  return () => {
    iframe.removeEventListener('pointerdown', notify)
    iframe.removeEventListener('focus', notify)
    iframe.removeEventListener('focusin', notify)
  }
}
