import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import NewGroup from './newRedacao';
import { useRouter } from 'expo-router';
import apiConfig from '../../api/axios';
import { ReactTestInstance } from 'react-test-renderer';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native'); // Importar View dentro do mock
  return {
    Link: ({ children }: { children: React.ReactNode }) => <View>{children}</View>, // ExpoRouterLink mockado como uma View
    useRouter: jest.fn(),
  };
});

const mockRouter = { push: jest.fn() };
(useRouter as jest.Mock).mockReturnValue(mockRouter);

jest.mock('../../api/axios');

describe('NewGroup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exibe imagem de loading ao iniciar', () => {
    render(<NewGroup />);
    expect(screen.getByTestId('loading-image')).toBeTruthy();
  });

  test('exibe lista de modelos após carregamento', async () => {
    const modelos = [
      { id: 1, titulo: 'Modelo 1', imagem: 'http://image1.jpg', corpo_redacao: 'Corpo 1' },
      { id: 2, titulo: 'Modelo 2', imagem: 'http://image2.jpg', corpo_redacao: 'Corpo 2' },
    ];
    (apiConfig.get as jest.Mock).mockResolvedValueOnce({ data: modelos });

    render(<NewGroup />);
    await waitFor(() => expect(screen.queryByTestId('loading-image')).toBeNull());

    modelos.forEach(modelo => {
      expect(screen.getByText(modelo.titulo)).toBeTruthy();
    });
  });

  test('navega para editmodelo com dados corretos ao clicar em um modelo', async () => {
    const modelo = { id: 1, titulo: 'Modelo 1', imagem: 'http://image1.jpg', corpo_redacao: 'Corpo 1' };
    (apiConfig.get as jest.Mock).mockResolvedValueOnce({ data: [modelo] });

    render(<NewGroup />);
    await waitFor(() => expect(screen.queryByTestId('loading-image')).toBeNull());

    const modeloButton = screen.getByText(modelo.titulo);
    fireEvent.press(modeloButton);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: './editmodelo',
      params: { modeloTexto: modelo.corpo_redacao, modeloTitulo: modelo.titulo },
    });
  });

  test('captura erro ao falhar ao carregar modelos', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (apiConfig.get as jest.Mock).mockRejectedValueOnce(new Error('Erro ao buscar modelos'));

    render(<NewGroup />);
    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar modelos de redação:', expect.any(Error)));

    consoleErrorSpy.mockRestore();
  });
});
