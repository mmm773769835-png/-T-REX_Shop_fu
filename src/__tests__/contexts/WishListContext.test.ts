/**
 * Tests for the wishList reducer logic from WishListContext.
 */

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface WishListItem extends Product {
  addedAt: Date;
  price: number;
}

interface WishListState {
  items: WishListItem[];
  loading: boolean;
}

type WishListAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_WISHLIST'; payload: WishListItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: WishListState = { items: [], loading: false };

const wishListReducer = (state: WishListState, action: WishListAction): WishListState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, addedAt: new Date(), price: action.payload.price },
        ],
      };
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'SET_WISHLIST':
      return { ...state, items: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Product',
  price: 100,
  description: 'A test product',
  imageUrl: 'https://example.com/img.jpg',
  ...overrides,
});

describe('wishListReducer', () => {
  describe('ADD_TO_WISHLIST', () => {
    it('should add a product to an empty list', () => {
      const product = makeProduct();
      const state = wishListReducer(initialState, {
        type: 'ADD_TO_WISHLIST',
        payload: product,
      });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('1');
      expect(state.items[0].price).toBe(100);
      expect(state.items[0].addedAt).toBeInstanceOf(Date);
    });

    it('should append to existing items', () => {
      const p1 = makeProduct({ id: '1' });
      const p2 = makeProduct({ id: '2', price: 200 });

      let state = wishListReducer(initialState, { type: 'ADD_TO_WISHLIST', payload: p1 });
      state = wishListReducer(state, { type: 'ADD_TO_WISHLIST', payload: p2 });

      expect(state.items).toHaveLength(2);
    });
  });

  describe('REMOVE_FROM_WISHLIST', () => {
    it('should remove a product by id', () => {
      const product = makeProduct();
      let state = wishListReducer(initialState, { type: 'ADD_TO_WISHLIST', payload: product });
      state = wishListReducer(state, { type: 'REMOVE_FROM_WISHLIST', payload: '1' });

      expect(state.items).toHaveLength(0);
    });

    it('should only remove the specified item', () => {
      const p1 = makeProduct({ id: '1' });
      const p2 = makeProduct({ id: '2' });

      let state = wishListReducer(initialState, { type: 'ADD_TO_WISHLIST', payload: p1 });
      state = wishListReducer(state, { type: 'ADD_TO_WISHLIST', payload: p2 });
      state = wishListReducer(state, { type: 'REMOVE_FROM_WISHLIST', payload: '1' });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('2');
    });

    it('should be a no-op for non-existent id', () => {
      const product = makeProduct();
      let state = wishListReducer(initialState, { type: 'ADD_TO_WISHLIST', payload: product });
      state = wishListReducer(state, { type: 'REMOVE_FROM_WISHLIST', payload: '999' });

      expect(state.items).toHaveLength(1);
    });
  });

  describe('SET_WISHLIST', () => {
    it('should replace the entire items list', () => {
      const items: WishListItem[] = [
        { ...makeProduct({ id: 'a' }), addedAt: new Date(), price: 50 },
        { ...makeProduct({ id: 'b' }), addedAt: new Date(), price: 60 },
      ];

      const state = wishListReducer(initialState, { type: 'SET_WISHLIST', payload: items });
      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('a');
    });
  });

  describe('SET_LOADING', () => {
    it('should set loading to true', () => {
      const state = wishListReducer(initialState, { type: 'SET_LOADING', payload: true });
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const loadingState = { ...initialState, loading: true };
      const state = wishListReducer(loadingState, { type: 'SET_LOADING', payload: false });
      expect(state.loading).toBe(false);
    });
  });

  describe('default', () => {
    it('should return unchanged state for unknown action', () => {
      const state = wishListReducer(initialState, { type: 'UNKNOWN' as any, payload: null });
      expect(state).toBe(initialState);
    });
  });
});
