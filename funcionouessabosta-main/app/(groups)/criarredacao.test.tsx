import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import NovoModelo from './criarredacao';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('NovoModelo criarredacao', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar os campos de título e texto corretamente', () => {
    const { getByPlaceholderText } = render(<NovoModelo />);

    const tituloInput = getByPlaceholderText('Título');
    const textoInput = getByPlaceholderText('Escreva sua redação...');

    expect(tituloInput).toBeTruthy();
    expect(textoInput).toBeTruthy();
  });

  test('deve exibir alerta ao atingir 2000 caracteres no texto', async () => {
    const { getByPlaceholderText } = render(<NovoModelo />);
    const textoInput = getByPlaceholderText('Escreva sua redação...');
    fireEvent.changeText(textoInput, 'a'.repeat(2000));
     
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Atenção',
        'Você atingiu 2000 caracteres! Aproximadamente 30 linhas'
      );
    });
  });

  test('deve exibir alerta ao tentar salvar com título ou texto vazio', async () => {
    const { getByPlaceholderText, getByTestId } = render(<NovoModelo />);
    const salvarBotao = getByTestId('salvarBotao');
    fireEvent.press(salvarBotao);
  
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'A redação não pode estar vazia'
      );
    });
  });

  test('deve salvar a redação corretamente no AsyncStorage', async () => {
    const { getByPlaceholderText, getByTestId } = render(<NovoModelo />);
    const tituloInput = getByPlaceholderText('Título');
    const textoInput = getByPlaceholderText('Escreva sua redação...');
    const salvarBotao = getByTestId('salvarBotao'); 
  
    fireEvent.changeText(tituloInput, 'Título de Teste');
    fireEvent.changeText(textoInput, 'Texto da redação de teste');
    fireEvent.press(salvarBotao);
  
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'redacoes',
        expect.stringContaining('"titulo":"Título de Teste"')
      );
    });
  
    expect(Alert.alert).toHaveBeenCalledWith('Salvo', 'Sua redação foi salva com sucesso!');
  });

  test('deve exibir alerta ao salvar redação e ocorrer um erro no AsyncStorage', async () => {
    AsyncStorage.setItem = jest.fn().mockRejectedValue(new Error('Falha ao salvar no AsyncStorage'));
    const { getByPlaceholderText, getByTestId } = render(<NovoModelo />); 
  
    
    const tituloInput = getByPlaceholderText('Título');
    const textoInput = getByPlaceholderText('Escreva sua redação...');
    const salvarBotao = getByTestId('salvarBotao'); 
  
   
    fireEvent.changeText(tituloInput, 'Título de Teste');
    fireEvent.changeText(textoInput, 'Texto da redação de teste');
    fireEvent.press(salvarBotao);
  
    
    await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erro',
          'Houve um erro ao salvar sua redação.'
        );
      });
  });
});
