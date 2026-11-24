import { isSupabaseConfigured } from '../services/supabase.service';
import { mapProductRow, parseSizes } from './product.model';

describe('product.model helpers', () => {
  it('parseSizes trims, drops empties and duplicates', () => {
    expect(parseSizes(' S, M ,, L,M ')).toEqual(['S', 'M', 'L']);
    expect(parseSizes('')).toEqual(['Única']);
    expect(parseSizes(null)).toEqual(['Única']);
    expect(parseSizes(' , ')).toEqual(['Única']);
  });

  it('mapProductRow converts numeric strings and defaults category', () => {
    const p = mapProductRow({
      id: 3,
      name: 'Jean',
      description: null,
      price: '129900.00',
      category: '  ',
      sizes: '28, 30',
      image_url: 'x.jpg',
      available: true,
      featured: false,
      created_at: '2026-01-01'
    });
    expect(p.price).toBe(129900);
    expect(p.category).toBe('General');
    expect(p.sizes).toEqual(['28', '30']);
    expect(p.imageUrl).toBe('x.jpg');
  });

  it('isSupabaseConfigured detects placeholders', () => {
    expect(isSupabaseConfigured('TU_SUPABASE_URL', 'TU_SUPABASE_ANON_KEY')).toBeFalse();
    expect(isSupabaseConfigured('https://abc.supabase.co', 'TU_SUPABASE_ANON_KEY')).toBeFalse();
    expect(isSupabaseConfigured('https://abc.supabase.co', 'eyJhbGciOi')).toBeTrue();
  });
});

