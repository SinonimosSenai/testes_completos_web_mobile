import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import NovoModelo from './editmodelo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useLocalSearchParams: () => ({ modeloTitulo: 'Título Teste', modeloTexto: 'Texto Teste' }),
    Link: 'MockedLink',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(() => JSON.stringify([])),
}));

describe('NovoModelo Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar o título e o texto iniciais', () => {
      const { getByText, getByPlaceholderText, getByTestId, queryByPlaceholderText } = render(<NovoModelo />);

      expect(getByText('Título Teste')).toBeTruthy();
      expect(getByText('Texto Teste')).toBeTruthy();

      fireEvent.press(getByTestId('edit-button'));

      expect(queryByPlaceholderText('Título')).toBeTruthy();
      expect(queryByPlaceholderText('Escreva sua redação...')).toBeTruthy();
  });

    test('deve exibir alerta ao atingir 2000 caracteres no texto', () => {
        const alertMock = jest.spyOn(Alert, 'alert');
        const { getByPlaceholderText, getByTestId } = render(<NovoModelo />);

        fireEvent.press(getByTestId('edit-button'));

        const textoInput = getByPlaceholderText('Escreva sua redação...');
        fireEvent.changeText(textoInput, 'a'.repeat(2000));

        expect(alertMock).toHaveBeenCalledWith('Atenção', 'Você atingiu 2000 caracteres! Aproximadamente 30 linhas');
    });

    test('deve salvar uma nova redação no AsyncStorage', async () => {
      const { getByTestId, getByPlaceholderText } = render(<NovoModelo />);
  
      fireEvent.press(getByTestId('edit-button'));  // Ativa o modo de edição
  
      fireEvent.changeText(getByPlaceholderText('Título'), 'Novo Título');
      fireEvent.changeText(getByPlaceholderText('Escreva sua redação...'), 'Novo Texto');
  
      fireEvent.press(getByTestId('salvarBotao'));
  
      await waitFor(() => {
          expect(AsyncStorage.setItem).toHaveBeenCalledWith(
              'redacoes', 
              expect.any(String)  
          );
      });
  });
  
    
  
});

