import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it.each([
    ['', 'Digite o nome de uma cidade.'],
    ['   ', 'Digite o nome de uma cidade.'],
    [' a ', 'Digite ao menos 2 caracteres.'],
  ])('valida input %j com mensagem e foco sem disparar busca', async (value, message) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText('Buscar cidade');
    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(message);
    expect(input).toHaveFocus();
    expect(onSearch).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'São Paulo');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('não chama onSearch quando o input está vazio ou contém apenas espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText('Buscar cidade');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('chama onSearch com o termo informado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });
});
