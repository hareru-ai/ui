---
"@hareru/ui": patch
---

Fix `aria-label` values that assistive technologies ignored. `BreadcrumbEllipsis` and `PaginationEllipsis` now render with `role="img"`, so their labels ("More" and "More pages") are announced. The `DataQualityIndicator` alert summary now renders as a list (`<ul>` and `<li>`) labelled "Alert summary".
