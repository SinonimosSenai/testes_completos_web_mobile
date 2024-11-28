import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ArgumentScreen from './ia';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { NavigationContainer } from '@react-navigation/native';


describe('ArgumentScreen', () => {
    let mock: MockAdapter;
  
    beforeAll(() => {
      mock = new MockAdapter(axios);
      global.alert = jest.fn();
    });
  
    afterEach(() => {
      mock.reset();
      jest.clearAllMocks();
    });
  
    const renderWithNavigation = (component: React.ReactElement) => {
      return render(
        <NavigationContainer>{component}</NavigationContainer>
      );
    };

  test('deve renderizar os elementos principais', () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<ArgumentScreen />);
    expect(getByPlaceholderText('Digite o tema aqui...')).toBeTruthy();
    expect(getByText('Gerar Argumentos')).toBeTruthy();
  });

 
  test('deve exibir alerta ao tentar enviar sem preencher o tema', () => {
    const { getByText } = renderWithNavigation(<ArgumentScreen />);
    const gerarArgumentosButton = getByText('Gerar Argumentos');

    fireEvent.press(gerarArgumentosButton);

    expect(global.alert).toHaveBeenCalledWith('Por favor, insira um tema.');
  });

  test('deve exibir indicador de carregamento ao enviar tema', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<ArgumentScreen />);
    const temaInput = getByPlaceholderText('Digite o tema aqui...');
    const gerarArgumentosButton = getByText('Gerar Argumentos');

    fireEvent.changeText(temaInput, 'Tema de Teste');

    mock.onPost('http://192.168.1.56:3000/argumento').reply(200, 'Resposta de teste');

    fireEvent.press(gerarArgumentosButton);

    expect(getByText('Gerando redação...')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Resposta de teste')).toBeTruthy();
    });
  });

  test('deve exibir resposta ao receber dados da API', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<ArgumentScreen />);
    mock.onPost('http://192.168.1.56:3000/argumento').reply(200, 'Resposta de teste');

    fireEvent.changeText(getByPlaceholderText('Digite o tema aqui...'), 'Tema de Teste');
    fireEvent.press(getByText('Gerar Argumentos'));

    await waitFor(() => expect(getByText('Resposta de teste')).toBeTruthy());
  });

  test('deve exibir mensagem de erro ao falhar na API', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<ArgumentScreen />);
    mock.onPost('http://192.168.1.56:3000/argumento').networkError();

    fireEvent.changeText(getByPlaceholderText('Digite o tema aqui...'), 'Tema de Teste');
    fireEvent.press(getByText('Gerar Argumentos'));

    await waitFor(() => expect(getByText('Erro ao gerar argumentos. Tente novamente.')).toBeTruthy());
  });
});
