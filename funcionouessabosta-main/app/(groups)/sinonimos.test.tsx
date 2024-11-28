
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewGroup from './sinonimos';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native'; 

jest.mock('../../api/axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      casa: { sinonimos: ['moradia', 'habitação'] },
      carro: { sinonimos: ['automóvel', 'veículo'] },
    },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

describe('NewGroup Component', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
    });
  });

  test('Deve renderizar o título "Sinônimos"', () => {
    const { getByText } = render(
      <NavigationContainer>
        <NewGroup />
      </NavigationContainer>
    );
    expect(getByText('Sinônimos')).toBeTruthy();
  });

  test('Deve filtrar sinônimos com base na pesquisa', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <NavigationContainer>
        <NewGroup />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('casa')).toBeTruthy();
      expect(getByText('carro')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Pesquisar');
    fireEvent.changeText(searchInput, 'casa');

    await waitFor(() => {
      expect(getByText('casa')).toBeTruthy();
      expect(queryByText('carro')).toBeNull();
    });
  });

  test('Deve navegar de volta ao pressionar o botão de voltar', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <NewGroup />
      </NavigationContainer>
    );

    const goBackButton = getByTestId('back-button');
    fireEvent.press(goBackButton);

    expect(useNavigation().goBack).toHaveBeenCalled();
  });
});
