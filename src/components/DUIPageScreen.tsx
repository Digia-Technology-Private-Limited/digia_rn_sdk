import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DUIFactory } from './ui_factory';

/**
 * DUIPageScreen - Generic screen for dynamic DUI pages.
 * Use this as the only screen in your Stack.Navigator.
 * It will render any page by pageId passed in navigation params.
 */
export function DUIPageScreen({ route }: any) {
    const [page, setPage] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { pageId, params } = route.params || {};

    useEffect(() => {
        try {
            const duiPage = pageId
                ? DUIFactory.getInstance().createPage(pageId, params)
                : DUIFactory.getInstance().createInitialPage();
            setPage(duiPage);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, [pageId, params]);

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Loading Page</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!page) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return page;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff0000',
        marginBottom: 12,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
