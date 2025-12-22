import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLink } from '../ExternalLink';
import { openBrowserAsync } from 'expo-web-browser';
import { Link } from 'expo-router';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: { AUTOMATIC: 'AUTOMATIC' },
}));

jest.mock('expo-router', () => ({
  Link: jest.fn(({ children, onPress, ...props }) => {
    const { Text } = require('react-native');
    return (
      <Text onPress={onPress} {...props}>
        {children}
      </Text>
    );
  }),
}));

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios'; // Default to native
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByText } = render(<ExternalLink href="https://example.com">Link Text</ExternalLink>);

    // Assert
    expect(getByText('Link Text')).toBeTruthy();
  });

  it('should open browser on press in native', async () => {
    // Arrange
    const { getByText } = render(<ExternalLink href="https://example.com">Link Text</ExternalLink>);

    // Act
    fireEvent.press(getByText('Link Text'), {
      preventDefault: jest.fn(),
    });

    // Assert
    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com', expect.anything());
  });

  it('should not open browser on press in web', async () => {
    // Arrange
    Platform.OS = 'web';
    const { getByText } = render(<ExternalLink href="https://example.com">Link Text</ExternalLink>);

    // Act
    fireEvent.press(getByText('Link Text'), {
      preventDefault: jest.fn(),
    });

    // Assert
    expect(openBrowserAsync).not.toHaveBeenCalled();
  });
});
