/**
 * Voice Analytics Service
 * Tracks and analyzes voice search patterns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'voice_analytics';
const MAX_QUERIES = 500; // Maximum queries to store

/**
 * Log a voice search query
 * @param {string} transcript - Original voice transcript
 * @param {Object} keywords - Extracted keywords
 * @param {number} resultsCount - Number of results found
 */
export async function logQuery(transcript, keywords, resultsCount) {
    try {
        const data = await getAnalyticsData();

        const entry = {
            timestamp: new Date().toISOString(),
            transcript,
            keywords,
            resultsCount,
        };

        data.queries.unshift(entry);

        // Keep only last MAX_QUERIES
        if (data.queries.length > MAX_QUERIES) {
            data.queries = data.queries.slice(0, MAX_QUERIES);
        }

        // Update counters
        if (keywords.productType) {
            data.productTypes[keywords.productType] = (data.productTypes[keywords.productType] || 0) + 1;
        }
        if (keywords.skinType) {
            data.skinTypes[keywords.skinType] = (data.skinTypes[keywords.skinType] || 0) + 1;
        }
        if (keywords.concern) {
            data.concerns[keywords.concern] = (data.concerns[keywords.concern] || 0) + 1;
        }

        data.totalQueries++;

        await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));

        return entry;
    } catch (error) {
        console.error('Error logging voice query:', error);
    }
}

/**
 * Get analytics data
 * @returns {Object} - Analytics data
 */
export async function getAnalyticsData() {
    try {
        const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error getting analytics:', error);
    }

    return {
        queries: [],
        productTypes: {},
        skinTypes: {},
        concerns: {},
        totalQueries: 0,
    };
}

/**
 * Get insights from analytics
 * @returns {Object} - Insights
 */
export async function getInsights() {
    const data = await getAnalyticsData();

    // Sort by count
    const sortByCount = (obj) => {
        return Object.entries(obj)
            .sort(([, a], [, b]) => b - a)
            .map(([key, count]) => ({ name: key, count }));
    };

    const topProductTypes = sortByCount(data.productTypes).slice(0, 5);
    const topSkinTypes = sortByCount(data.skinTypes).slice(0, 5);
    const topConcerns = sortByCount(data.concerns).slice(0, 5);

    // Recent queries
    const recentQueries = data.queries.slice(0, 10);

    // Queries with no results
    const failedQueries = data.queries.filter(q => q.resultsCount === 0).slice(0, 10);

    return {
        totalQueries: data.totalQueries,
        topProductTypes,
        topSkinTypes,
        topConcerns,
        recentQueries,
        failedQueries,
    };
}

/**
 * Clear all analytics data
 */
export async function clearAnalytics() {
    try {
        await AsyncStorage.removeItem(ANALYTICS_KEY);
    } catch (error) {
        console.error('Error clearing analytics:', error);
    }
}

export default {
    logQuery,
    getAnalyticsData,
    getInsights,
    clearAnalytics,
};
