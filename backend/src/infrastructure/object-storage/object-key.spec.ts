import { buildDocumentVersionObjectKey } from './object-key';

describe('buildDocumentVersionObjectKey', () => {
  it('stores binaries by document and version id', () => {
    expect(
      buildDocumentVersionObjectKey(
        '11111111-1111-7111-8111-111111111111',
        '22222222-2222-7222-8222-222222222222',
        '.HWPX',
      ),
    ).toBe(
      'documents/11111111-1111-7111-8111-111111111111/versions/22222222-2222-7222-8222-222222222222.hwpx',
    );
  });
});
