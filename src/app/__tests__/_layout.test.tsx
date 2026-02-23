import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';
import { Stack } from 'expo-router';

jest.mock('expo-router', () => ({
    Stack: Object.assign(
        jest.fn(({ children }) => <>{children}</>),
        { Screen: jest.fn(() => null) }
    )
}));
jest.mock('expo-font', () => ({
    useFonts: () => [true, null]
}));
jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn()
}));
jest.mock('../../features/auth/stores/useUserStore', () => ({
    useUserStore: jest.fn()
}));
jest.mock('../../features/etymology/stores/useMasteryStore', () => ({
    useMasteryStore: () => jest.fn()
}));

describe('RootLayout', () => {
    it('etymology/[id]画面の戻るボタンテキストが非表示に設定されていること', () => {
        render(<RootLayout />);
        // Access the mock calls for Stack.Screen
        const screenMock = Stack.Screen as unknown as jest.Mock;
        const etymologyScreenCall = screenMock.mock.calls.find(
            (call) => call[0].name === 'etymology/[id]'
        );
        expect(etymologyScreenCall).toBeDefined();
        expect(etymologyScreenCall[0].options.headerBackTitleVisible).toBe(false);
    });
});
