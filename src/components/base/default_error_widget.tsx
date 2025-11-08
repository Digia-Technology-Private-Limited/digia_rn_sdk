import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorUtil } from '../../framework/utils/color_util';

interface DefaultErrorWidgetProps {
    errorMessage: string;
    refName?: string;
    errorDetails?: any;
}

export const DefaultErrorWidget: React.FC<DefaultErrorWidgetProps> = ({
    errorMessage,
    refName,
    errorDetails,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <View style={styles.spacer} />
                    <Text style={styles.title}>
                        Error Rendering Widget {refName ?? ''}
                    </Text>
                </View>
                <View style={styles.messageSpacer} />
                <Text style={styles.message}>{errorMessage}</Text>
                {errorDetails != null && (
                    <>
                        <View style={styles.detailsSpacer} />
                        <Text style={styles.details}>
                            Details: {String(errorDetails)}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: ColorUtil.fromHexString('#F9E6EB'),
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorIcon: {
        fontSize: 18,
        color: '#FF0000',
    },
    spacer: {
        width: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF0000',
    },
    messageSpacer: {
        height: 8,
    },
    message: {
        fontSize: 14,
        color: '#000000DE',
        textAlign: 'center',
    },
    detailsSpacer: {
        height: 16,
    },
    details: {
        fontSize: 12,
        color: '#9E9E9E',
        textAlign: 'center',
    },
});
