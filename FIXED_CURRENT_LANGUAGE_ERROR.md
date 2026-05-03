# Fixed ReferenceError: Property 'currentLanguage' doesn't exist

## Problem Description

The application was throwing the following error:
```
ERROR  [ReferenceError: Property 'currentLanguage' doesn't exist]
```

This error occurred because in a previous update, I modified the `SidebarV2` component to directly use the LanguageContext instead of receiving language values as props. However, some parts of the code were still referencing `currentLanguage` instead of using the `language` value directly from the context.

## Root Cause

In the `SidebarV2.tsx` file, there were multiple instances where the code was using `currentLanguage`:
```jsx
{currentLanguage === "ar" ? "EN" : "AR"}
```

But the component interface was updated to remove the `currentLanguage` prop, and the component was modified to use the `language` value directly from the LanguageContext:
```jsx
const { language } = useContext(LanguageContext);
```

## Solution

Updated all instances of `currentLanguage` to use `language` directly in the `SidebarV2.tsx` file:

### Files Modified:
- `src/screens/components/SidebarV2.tsx`

### Changes Made:
1. Replaced all `{currentLanguage === "ar" ? ...}` with `{language === "ar" ? ...}`
2. Replaced all `currentLanguage === "ar" ? ...` with `language === "ar" ? ...` in Alert messages
3. Verified that the component properly consumes the LanguageContext

## Verification

Created and ran a test script that confirmed:
- No remaining `currentLanguage` references in `SidebarV2.tsx`
- 14 proper `language` references found (as expected)
- Valid `currentLanguage` alias still exists in `HomeV2.tsx` (this is fine as it's a local alias)

## Result

The ReferenceError has been resolved, and the language toggle functionality should now work correctly in the sidebar component.