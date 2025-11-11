import React, { createContext, useContext, ReactNode } from 'react';

interface ScaffoldController {
    setCurrentIndex: (index: number) => void;
    currentIndex: number;
}

const InheritedScaffoldControllerContext = createContext<ScaffoldController | null>(null);

interface InheritedScaffoldControllerProps {
    setCurrentIndex: (index: number) => void;
    currentIndex: number;
    children: ReactNode;
}

export const InheritedScaffoldController: React.FC<InheritedScaffoldControllerProps> = ({
    setCurrentIndex,
    currentIndex,
    children,
}) => {
    const contextValue: ScaffoldController = {
        setCurrentIndex,
        currentIndex,
    };

    return (
        <InheritedScaffoldControllerContext.Provider value={contextValue}>
            {children}
        </InheritedScaffoldControllerContext.Provider>
    );
};

/**
 * Retrieves the InheritedScaffoldController from the context or returns null if not found
 */
export const useMaybeInheritedScaffoldController = (): ScaffoldController | null => {
    return useContext(InheritedScaffoldControllerContext);
};

/**
 * Retrieves the InheritedScaffoldController from the context and throws an error if not found
 */
export const useInheritedScaffoldController = (): ScaffoldController => {
    const controller = useContext(InheritedScaffoldControllerContext);

    if (controller === null) {
        throw new Error('No InheritedScaffoldController found in context');
    }

    return controller;
};

