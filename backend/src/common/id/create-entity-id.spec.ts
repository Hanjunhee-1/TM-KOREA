import { createEntityId } from './create-entity-id';

describe('createEntityId', () => {
  it('returns UUID v7 shaped identifiers', () => {
    const id = createEntityId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('is time-sortable for sequential generation', () => {
    const first = createEntityId();
    const second = createEntityId();
    expect(first < second || first.slice(0, 13) === second.slice(0, 13)).toBe(
      true,
    );
  });
});
