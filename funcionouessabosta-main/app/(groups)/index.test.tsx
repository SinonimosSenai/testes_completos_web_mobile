import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './index';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

jest.mock('expo-file-system', () => ({
    documentDirectory: 'mockedDocumentDirectory/',
    writeAsStringAsync: jest.fn(),
    EncodingType: {
        UTF8: 'utf8',
    },
}));
jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn(),
}));


// Função auxiliar para envolver o componente no NavigationContainer
const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe('Componente Home', () => {
    test('deve renderizar a mensagem de lista vazia quando não há redações', () => {
        const { getByText } = renderWithNavigation(<Home />);
        expect(getByText('Nenhuma redação salva.')).toBeTruthy();
    });

    test('deve renderizar os cards de redações quando há dados', async () => {
        const redacoesMock = [
            { id: '1', titulo: 'Título 1', texto: 'Texto da redação 1' },
            { id: '2', titulo: 'Título 2', texto: 'Texto da redação 2' },
        ];

        const AsyncStorage = require('@react-native-async-storage/async-storage');
        AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(redacoesMock));

        const { findByText } = renderWithNavigation(<Home />);
        expect(await findByText('Título 1')).toBeTruthy();
        expect(await findByText('Título 2')).toBeTruthy();
    });



    test('deve chamar a função de navegação ao pressionar um card', async () => {
        const redacoesMock = [
            { id: '1', titulo: 'Título 1', texto: 'Texto da redação 1' },
        ];

        const useRouter = require('expo-router').useRouter;
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        const AsyncStorage = require('@react-native-async-storage/async-storage');
        AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(redacoesMock));

        const { findByTestId } = renderWithNavigation(<Home />);
        const editButton = await findByTestId('edit-button');

        fireEvent.press(editButton);

        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/visualizacao',
            params: redacoesMock[0],
        });
    });
    test('deve chamar a função de remoção de redação corretamente', async () => {
      // Redações simuladas
      const mockRedacoes = [
          { id: '1', titulo: 'Redação 1', corpo: 'Texto da redação 1' },
      ];

      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce(JSON.stringify(mockRedacoes));

      const { getByTestId } = renderWithNavigation(<Home />);

      await act(async () => {});

      const removeButton = getByTestId('remove-button');

      await act(async () => {
          fireEvent.press(removeButton);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'redacoes',
          JSON.stringify([])
      );
  });
});