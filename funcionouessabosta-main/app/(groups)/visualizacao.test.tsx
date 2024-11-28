
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import Visualizacao from './visualizacao';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useLocalSearchParams: () => ({ id: '1', titulo: 'Título Teste', texto: 'Texto Teste' }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(() => JSON.stringify([{ id: '1', titulo: 'Título Teste', texto: 'Texto Teste' }])),
}));

describe('Visualizacao Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar o título e o texto iniciais', () => {
        const { getByText } = render(<Visualizacao />);

        expect(getByText('Título Teste')).toBeTruthy();
        expect(getByText('Texto Teste')).toBeTruthy();
    });

    test('deve alternar para modo de edição e salvar mudanças', async () => {
        const alertMock = jest.spyOn(Alert, 'alert');
        const { getByText, getByPlaceholderText } = render(<Visualizacao />);
        const editButton = getByText('edit'); 
        fireEvent.press(editButton);

        const inputField = getByPlaceholderText('Escreva sua redação...');
        fireEvent.changeText(inputField, 'Novo Texto Teste');

        fireEvent.press(getByText('save'));

        await waitFor(() => {
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'redacoes',
                JSON.stringify([{ id: '1', titulo: 'Título Teste', texto: 'Novo Texto Teste' }])
            );
            expect(alertMock).toHaveBeenCalledWith('Salvo', 'Sua redação foi salva com sucesso!');
        });
    });

    test('não deve salvar se o título ou texto estiver vazio', async () => {
        const alertMock = jest.spyOn(Alert, 'alert');
        const { getByText, getByPlaceholderText } = render(<Visualizacao />);

        fireEvent.press(getByText('edit'));

        fireEvent.changeText(getByPlaceholderText('Título'), '');
        fireEvent.changeText(getByPlaceholderText('Escreva sua redação...'), '');

        fireEvent.press(getByText('save'));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith('A redação não pode estar vazia');
        });
    });
});
