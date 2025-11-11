import React, { createContext, useContext } from 'react';

interface InheritedNavBarControllerValue {
    itemIndex: number;
}

const InheritedNavBarControllerContext = createContext<InheritedNavBarControllerValue | null>(null);

export const InheritedNavigationBarControllerProvider: React.FC<{
    itemIndex: number;
    children: React.ReactNode;
}> = ({ itemIndex, children }) => {
    return (
        <InheritedNavBarControllerContext.Provider value={{ itemIndex }}>
            {children}
        </InheritedNavBarControllerContext.Provider>
    );
};

/**
 * Returns the navigation bar controller value if present, otherwise null.
 */
/**
 * Hook: returns the navigation bar controller value if present, otherwise null.
 * Use inside React function components.
 */
export function useMaybeInheritedNavigationBarController(): InheritedNavBarControllerValue | null {
    return useContext(InheritedNavBarControllerContext);
}

/**
 * Hook: returns the navigation bar controller value and throws if not present.
 * Use inside React function components.
 */
export function useInheritedNavigationBarController(): InheritedNavBarControllerValue {
    const value = useContext(InheritedNavBarControllerContext);
    if (!value) {
        throw new Error('No InheritedNavigationBarController found in context');
    }
    return value;
}
