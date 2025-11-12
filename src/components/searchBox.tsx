import type { SizeTokens } from 'tamagui';
import { Button, Input, XStack } from 'tamagui';

interface SearchBoxProps {
  size: SizeTokens;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
}

export default function SearchBox(props: SearchBoxProps) {
  return (
    <XStack alignItems="center" gap="$2">
      <Input
        flex={1}
        size={props.size}
        placeholder={`输入搜索的内容`}
        value={props.value}
        onChangeText={props.onChangeText}
      />
      <Button size={props.size} theme="blue" onPress={props.onSearch}>
        Go
      </Button>
    </XStack>
  );
}
