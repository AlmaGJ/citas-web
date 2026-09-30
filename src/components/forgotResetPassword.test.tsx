import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import * as lifecycleApi from '../api/lifecycleApi';

vi.mock('../api/lifecycleApi', async (original) => {
  const actual = await original<typeof import('../api/lifecycleApi')>();
  return { ...actual, requestPasswordRecovery: vi.fn(), resetPassword: vi.fn() };
});

describe('recuperación y restablecimiento de contraseña', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía la recuperación y muestra un mensaje genérico de éxito', async () => {
    const user = userEvent.setup();
    vi.mocked(lifecycleApi.requestPasswordRecovery).mockResolvedValue(undefined);
    render(<ForgotPasswordScreen onNavigateLogin={vi.fn()} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    expect(lifecycleApi.requestPasswordRecovery).toHaveBeenCalledWith('ana@example.com');
    expect(await screen.findByRole('status')).toHaveTextContent(/si el correo está registrado/i);
  });

  it('restablece la contraseña cuando ambos campos coinciden', async () => {
    const user = userEvent.setup();
    vi.mocked(lifecycleApi.resetPassword).mockResolvedValue(undefined);
    render(<ResetPasswordScreen token="tok-123" onNavigateLogin={vi.fn()} />);

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'Password123*');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123*');
    await user.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    expect(lifecycleApi.resetPassword).toHaveBeenCalledWith('tok-123', 'Password123*', 'Password123*');
    expect(await screen.findByRole('status')).toHaveTextContent(/contraseña fue actualizada|ya puedes iniciar sesión/i);
  });

  it('rechaza el restablecimiento si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordScreen token="tok-123" onNavigateLogin={vi.fn()} />);

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'Password123*');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Otra456*');
    await user.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no coinciden/i);
    expect(lifecycleApi.resetPassword).not.toHaveBeenCalled();
  });
});
