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

import * as Comments from '../index';

describe('Comments Index Export', () => {
  it('should export all comment components', () => {
    expect(Comments.CommentInput).toBeDefined();
    expect(Comments.CommentItem).toBeDefined();
    expect(Comments.CommentList).toBeDefined();
    expect(Comments.CommentSection).toBeDefined();
    expect(Comments.useComments).toBeDefined();
  });
});
