import { readFileSync, writeFileSync } from 'node:fs';

const cssFiles = [
  '../tokens/dist/theme.css',
  'src/styles/base.css',
  'src/components/AspectRatio/AspectRatio.css',
  'src/components/Alert/Alert.css',
  'src/components/AlertDialog/AlertDialog.css',
  'src/components/Avatar/Avatar.css',
  'src/components/Badge/Badge.css',
  'src/components/BentoGrid/BentoGrid.css',
  'src/components/Button/Button.css',
  'src/components/Card/Card.css',
  'src/components/Collapsible/Collapsible.css',
  'src/components/Combobox/Combobox.css',
  'src/components/Command/Command.css',
  'src/components/Dialog/Dialog.css',
  'src/components/DropdownMenu/DropdownMenu.css',
  'src/components/EmptyState/EmptyState.css',
  'src/components/FormField/FormField.css',
  'src/components/Input/Input.css',
  'src/components/Label/Label.css',
  'src/components/NavigationMenu/NavigationMenu.css',
  'src/components/Popover/Popover.css',
  'src/components/Progress/Progress.css',
  'src/components/ScrollArea/ScrollArea.css',
  'src/components/Select/Select.css',
  'src/components/Separator/Separator.css',
  'src/components/Sheet/Sheet.css',
  'src/components/Skeleton/Skeleton.css',
  'src/components/Switch/Switch.css',
  'src/components/Tabs/Tabs.css',
  'src/components/Textarea/Textarea.css',
  'src/components/Toast/Toast.css',
  'src/components/Toggle/Toggle.css',
  'src/components/Tooltip/Tooltip.css',
  'src/components/ChatContainer/ChatContainer.css',
  'src/components/ChatMessage/ChatMessage.css',
  'src/components/StreamingText/StreamingText.css',
  'src/components/MetricCard/MetricCard.css',
  'src/components/DefinitionBrowser/DefinitionBrowser.css',
  'src/components/DataQualityIndicator/DataQualityIndicator.css',
  'src/components/ToolCallCard/ToolCallCard.css',
  'src/components/ApprovalCard/ApprovalCard.css',
  'src/components/ChatComposer/ChatComposer.css',
  'src/components/ReasoningPanel/ReasoningPanel.css',
];

const css = cssFiles
  .map((f) => {
    try {
      return readFileSync(f, 'utf-8');
    } catch (e) {
      throw new Error(`Failed to read CSS file: ${f}`, { cause: e });
    }
  })
  .join('\n\n');

writeFileSync('dist/styles.css', css, 'utf-8');
console.log('Bundled dist/styles.css');
