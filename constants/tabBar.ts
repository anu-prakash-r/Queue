export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_FLOAT_GAP = 12;
export const TAB_BAR_SIDE_GAP = 18;

/** Space the floating tab bar occupies, including the system gesture/home inset. */
export function getFloatingTabBarOffset(bottomInset: number) {
  return TAB_BAR_HEIGHT + TAB_BAR_FLOAT_GAP + bottomInset;
}
