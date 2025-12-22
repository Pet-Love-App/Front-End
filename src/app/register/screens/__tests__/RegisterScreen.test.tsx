import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';
import { useRegisterForm } from '../../hooks';

// Mock useRegisterForm hook
jest.mock('../../hooks', () => ({
  useRegisterForm: jest.fn(),
}));

// Mock LottieAnimation
jest.mock('@/src/components/LottieAnimation', () => ({
  LottieAnimation: () => <></>,
}));

// Mock SafeArea
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('RegisterScreen', () => {
  const mockHandleEmailChange = jest.fn();
  const mockHandleUsernameChange = jest.fn();
  const mockHandlePasswordChange = jest.fn();
  const mockHandleRegister = jest.fn();
  const mockNavigateBack = jest.fn();

  const defaultHookValues = {
    email: '',
    username: '',
    password: '',
    errors: {},
    isLoading: false,
    handleEmailChange: mockHandleEmailChange,
    handleUsernameChange: mockHandleUsernameChange,
    handlePasswordChange: mockHandlePasswordChange,
    handleRegister: mockHandleRegister,
    navigateBack: mockNavigateBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRegisterForm as jest.Mock).mockReturnValue(defaultHookValues);
  });

  it('should render correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

    expect(getByText('注册新账号')).toBeTruthy();
    expect(getByText('加入Pet Love大家庭')).toBeTruthy();
    expect(getByPlaceholderText('邮箱地址')).toBeTruthy();
    expect(getByPlaceholderText('用户名（3-150个字符）')).toBeTruthy();
    expect(getByPlaceholderText('密码（至少6位，含字母和数字）')).toBeTruthy();
    expect(getByText('注册')).toBeTruthy();
  });

  it('should display input values', () => {
    (useRegisterForm as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });

    const { getByDisplayValue } = render(<RegisterScreen />);

    expect(getByDisplayValue('test@example.com')).toBeTruthy();
    expect(getByDisplayValue('testuser')).toBeTruthy();
    expect(getByDisplayValue('password123')).toBeTruthy();
  });

  it('should call handleEmailChange when email input changes', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const emailInput = getByPlaceholderText('邮箱地址');

    fireEvent.changeText(emailInput, 'new@example.com');

    expect(mockHandleEmailChange).toHaveBeenCalledWith('new@example.com');
  });

  it('should call handleUsernameChange when username input changes', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const usernameInput = getByPlaceholderText('用户名（3-150个字符）');

    fireEvent.changeText(usernameInput, 'newuser');

    expect(mockHandleUsernameChange).toHaveBeenCalledWith('newuser');
  });

  it('should call handlePasswordChange when password input changes', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const passwordInput = getByPlaceholderText('密码（至少6位，含字母和数字）');

    fireEvent.changeText(passwordInput, 'newpassword');

    expect(mockHandlePasswordChange).toHaveBeenCalledWith('newpassword');
  });

  it('should call handleRegister when register button is pressed', () => {
    const { getByText } = render(<RegisterScreen />);
    const registerButton = getByText('注册');

    fireEvent.press(registerButton);

    expect(mockHandleRegister).toHaveBeenCalled();
  });

  it('should display error messages when errors exist', () => {
    (useRegisterForm as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      errors: {
        email: 'Invalid email',
        username: 'Invalid username',
        password: 'Password too short',
      },
    });

    const { getByText } = render(<RegisterScreen />);

    expect(getByText('Invalid email')).toBeTruthy();
    expect(getByText('Invalid username')).toBeTruthy();
    expect(getByText('Password too short')).toBeTruthy();
  });
});
