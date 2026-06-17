# TDS Component Reference — @toss/tds-mobile v2.4.0

Props and usage patterns of TDS components used in toss-contract-app.

## Layout

### Top
Page top title bar. Root navigation for all pages.

```tsx
<Top title="Page Title" subtitle="Sub description" onBack={() => navigate(-1)} />
```

| Prop | Type | Description |
|------|------|-------------|
| title | string | Page title |
| subtitle | string | Secondary text below title |
| onBack | () => void | Back handler |
| backButton | boolean | Whether to show the back button |

### Spacing
Spacing control. Uses numeric values only.

```tsx
<Spacing size={16} />
```

| Prop | Type | Values |
|------|------|--------|
| size | number | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |

### BottomSheet
Bottom slide panel. Primarily used on mobile.

```tsx
<BottomSheet open={isOpen} onClose={() => setOpen(false)}>
  {/* Content */}
</BottomSheet>
```

| Prop | Type | Description |
|------|------|-------------|
| open | boolean | Open state |
| onClose | () => void | Close handler |

### OverlayProvider
Root container for overlays (BottomSheet, Dialog, etc.). Placed at the top of the App.

## Input

### TextField
Text input. Most frequently used in forms.

```tsx
<TextField
  label="Employee Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  error={errors.name}
  placeholder="Hong Gil-dong"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| label | string | Field label |
| value | string | Input value |
| onChange | (e: ChangeEvent) => void | Change handler |
| required | boolean | Required indicator |
| error | string \| undefined | Error message |
| placeholder | string | Placeholder |
| disabled | boolean | Disabled state |

### Button
Action button. Styles differentiated by variant.

```tsx
<Button variant="primary" disabled={!isValid} onClick={handleSubmit}>
  Next
</Button>
```

| Prop | Type | Values |
|------|------|--------|
| variant | string | primary, secondary, danger |
| size | string | small, medium, large |
| disabled | boolean | Disabled state |
| onClick | () => void | Click handler |

### TextButton
Text-only button. Used for secondary actions.

```tsx
<TextButton variant="secondary" onClick={handleSkip}>Skip</TextButton>
```

| Prop | Type | Values |
|------|------|--------|
| variant | string | primary, secondary |

### ButtonGroup
Groups buttons together. Primarily used in fixed bottom areas.

```tsx
<ButtonGroup direction="vertical" spacing={12}>
  <Button variant="primary" onClick={handleSubmit}>Next</Button>
  <Button variant="secondary" onClick={handleSkip}>Skip</Button>
</ButtonGroup>
```

| Prop | Type | Values |
|------|------|--------|
| direction | string | horizontal, vertical |
| spacing | number | 8, 12 |

### List / ListRow
List items. Used in settings screens and information display.

```tsx
<List>
  <ListRow title="Name" subtitle="Hong Gil-dong" right={<Badge color="blue">Active</Badge>} onClick={handleClick} />
</List>
```

#### ListRow Props

| Prop | Type | Description |
|------|------|-------------|
| title | string | Title |
| subtitle | string | Secondary text |
| right | ReactNode | Right-side custom element |
| onClick | () => void | Click handler |

## Display

### Paragraph
Text display. Size/color controlled via typography.

```tsx
<Paragraph typography="st1" fontWeight="bold" color="grey-900">Title Text</Paragraph>
```

| Prop | Type | Values |
|------|------|--------|
| typography | string | st1, st2, st3, st4, st5, st6, st7 |
| fontWeight | string | regular, medium, bold |
| color | string | grey-500, grey-700, grey-900 |

### Badge
Status indicator badge. Used for contract status, etc.

```tsx
<Badge color="green">Active</Badge>
```

| Prop | Type | Values |
|------|------|--------|
| color | string | blue, teal, green, red, yellow, elephant |

### Border
Divider line.

```tsx
<Border />
```

## Form (Wizard)

### useFunnel
Multi-step form management. Import from `@use-funnel/browser`.

```tsx
import { useFunnel } from '@use-funnel/browser';

const FunnelComponent = () => {
  const { current, next, prev } = useFunnel({
    steps: ['basicInfo', 'salary', 'schedule', 'benefits', 'review', 'confirm', 'complete'],
    defaultStep: 'basicInfo',
  });
  // ...
};
```

## Project Actual Usage Patterns

TDS component usage patterns in the project:

1. **All pages**: Rendered inside `<ThemeProvider>` (`src/main.tsx`)
2. **Navigation**: `<Top>` + `onBack` + router integration
3. **Form steps**: Step management with `useFunnel`, each step is a separate component
4. **Bottom actions**: `<ButtonGroup direction="vertical">` + `<Button variant="primary">` combination
5. **Status display**: Display contract status with `<Badge color={statusColor}>`
6. **Spacing**: Use `<Spacing size={N} />` (avoid direct margin/padding usage)
