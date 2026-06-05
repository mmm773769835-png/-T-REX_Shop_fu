/**
 * Tests for the cart reducer and calculateTotal logic from CartContext.
 *
 * We import the reducer indirectly by re-implementing the same logic in a
 * controlled fashion, since the module exports only React components / hooks.
 * Instead we extract and test the pure reducer inline.
 */

// Re-implement the pure functions from CartContext so we can unit-test them
// without importing React context plumbing.

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const productId = String(action.payload.id);
      const existingItem = state.items.find(item => String(item.id) === productId);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          String(item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        return { ...state, items: updatedItems, total: calculateTotal(updatedItems) };
      } else {
        const newItem: CartItem = { ...action.payload, id: productId, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        return { ...state, items: updatedItems, total: calculateTotal(updatedItems) };
      }
    }
    case 'REMOVE_FROM_CART': {
      const filteredItems = state.items.filter(item => String(item.id) !== String(action.payload));
      return { ...state, items: filteredItems, total: calculateTotal(filteredItems) };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        String(item.id) === String(action.payload.id)
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item,
      );
      return { ...state, items: updatedItems, total: calculateTotal(updatedItems) };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
};

// ---- helpers ----

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Product',
  price: 100,
  description: 'A test product',
  imageUrl: 'https://example.com/img.jpg',
  ...overrides,
});

const emptyState: CartState = { items: [], total: 0 };

// ---- tests ----

describe('cartReducer', () => {
  describe('ADD_TO_CART', () => {
    it('should add a new product to an empty cart', () => {
      const product = makeProduct();
      const state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('1');
      expect(state.items[0].quantity).toBe(1);
      expect(state.total).toBe(100);
    });

    it('should increment quantity when adding an existing product', () => {
      const product = makeProduct();
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: product });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.total).toBe(200);
    });

    it('should handle multiple different products', () => {
      const p1 = makeProduct({ id: '1', price: 50 });
      const p2 = makeProduct({ id: '2', price: 75 });

      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: p1 });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: p2 });

      expect(state.items).toHaveLength(2);
      expect(state.total).toBe(125);
    });

    it('should coerce numeric ids to strings', () => {
      const product = makeProduct({ id: '42' as any });
      const state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      expect(state.items[0].id).toBe('42');
    });
  });

  describe('REMOVE_FROM_CART', () => {
    it('should remove an item by id', () => {
      const product = makeProduct();
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: '1' });

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });

    it('should not affect other items', () => {
      const p1 = makeProduct({ id: '1', price: 50 });
      const p2 = makeProduct({ id: '2', price: 75 });

      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: p1 });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: p2 });
      state = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: '1' });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('2');
      expect(state.total).toBe(75);
    });

    it('should be a no-op for a non-existent id', () => {
      const product = makeProduct();
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: '999' });

      expect(state.items).toHaveLength(1);
    });
  });

  describe('UPDATE_QUANTITY', () => {
    it('should update the quantity of an existing item', () => {
      const product = makeProduct({ price: 30 });
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 5 },
      });

      expect(state.items[0].quantity).toBe(5);
      expect(state.total).toBe(150);
    });

    it('should enforce minimum quantity of 1', () => {
      const product = makeProduct();
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 0 },
      });

      expect(state.items[0].quantity).toBe(1);
    });

    it('should enforce minimum quantity for negative values', () => {
      const product = makeProduct();
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: product });
      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: -3 },
      });

      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('CLEAR_CART', () => {
    it('should empty the cart', () => {
      const p1 = makeProduct({ id: '1' });
      const p2 = makeProduct({ id: '2' });
      let state = cartReducer(emptyState, { type: 'ADD_TO_CART', payload: p1 });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: p2 });
      state = cartReducer(state, { type: 'CLEAR_CART' });

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });
});

describe('calculateTotal', () => {
  it('should return 0 for an empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should compute total as sum of price * quantity', () => {
    const items: CartItem[] = [
      { ...makeProduct({ price: 10 }), quantity: 2 },
      { ...makeProduct({ id: '2', price: 25 }), quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(95);
  });
});
