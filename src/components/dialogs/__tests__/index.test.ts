import * as Dialogs from '../index';

jest.mock('tamagui', () => {
  const React = require('react');
  const Component = ({ children }: { children: any }) => children;
  return {
    Text: Component,
    XStack: Component,
    YStack: Component,
    Button: Component,
    Input: Component,
    TextArea: Component,
    ScrollView: Component,
    View: Component,
    Stack: Component,
    Spinner: Component,
    styled: (Component: any) => Component,
    Dialog: {
      ...Component,
      Trigger: Component,
      Portal: Component,
      Overlay: Component,
      Content: Component,
      Title: Component,
      Description: Component,
      Close: Component,
    },
  };
});

describe('Dialogs Index Export', () => {
  it('should export all dialog components', () => {
    expect(Dialogs.ConfirmDialog).toBeDefined();
    expect(Dialogs.FormDialog).toBeDefined();
    expect(Dialogs.ContentDialog).toBeDefined();
    expect(Dialogs.Toast).toBeDefined();
    expect(Dialogs.ToastManager).toBeDefined();
    expect(Dialogs.toast).toBeDefined();
    expect(Dialogs.useToastStore).toBeDefined();
    expect(Dialogs.AlertManager).toBeDefined();
    expect(Dialogs.showAlert).toBeDefined();
    expect(Dialogs.Alert).toBeDefined();
    expect(Dialogs.useAlertStore).toBeDefined();
    expect(Dialogs.DialogHeader).toBeDefined();
    expect(Dialogs.DialogFooter).toBeDefined();
  });
});
