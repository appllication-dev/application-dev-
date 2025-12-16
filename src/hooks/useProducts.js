/**
 * Custom hooks for Product handling using React Query
 * Implements caching, background updates, and offline support
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService, {
    getProducts,
    getProductById,
    searchProducts,
    getFeaturedProducts
} from '../services/productService';

// Keys for caching
export const PRODUCT_KEYS = {
    all: ['products'],
    lists: () => [...PRODUCT_KEYS.all, 'list'],
    list: (filters) => [...PRODUCT_KEYS.lists(), { filters }],
    details: () => [...PRODUCT_KEYS.all, 'detail'],
    detail: (id) => [...PRODUCT_KEYS.details(), id],
    search: (query) => [...PRODUCT_KEYS.all, 'search', query],
    featured: () => [...PRODUCT_KEYS.all, 'featured'],
};

/**
 * Hook to fetch products with pagination and filters
 */
export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: PRODUCT_KEYS.list(params),
        queryFn: () => getProducts(params),
        keepPreviousData: true,
    });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id) => {
    return useQuery({
        queryKey: PRODUCT_KEYS.detail(id),
        queryFn: () => getProductById(id),
        enabled: !!id, // Only run if ID exists
    });
};

/**
 * Hook to search products
 */
export const useSearchProducts = (query) => {
    return useQuery({
        queryKey: PRODUCT_KEYS.search(query),
        queryFn: () => searchProducts(query),
        enabled: !!query && query.length >= 2,
        staleTime: 1000 * 60, // Cache search results for 1 minute
    });
};

/**
 * Hook to fetch featured products
 */
export const useFeaturedProducts = () => {
    return useQuery({
        queryKey: PRODUCT_KEYS.featured(),
        queryFn: () => getFeaturedProducts(),
        staleTime: 1000 * 60 * 10, // Featured products don't change often
    });
};

export default {
    useProducts,
    useProduct,
    useSearchProducts,
    useFeaturedProducts,
};
