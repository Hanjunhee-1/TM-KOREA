const OBJECT_KEY_PREFIX = 'documents';

export function normalizeExtension(extension: string): string {
  return extension.replace(/^\./, '').toLowerCase();
}

export function buildDocumentVersionObjectKey(
  documentId: string,
  versionId: string,
  extension: string,
): string {
  return `${OBJECT_KEY_PREFIX}/${documentId}/versions/${versionId}.${normalizeExtension(extension)}`;
}
