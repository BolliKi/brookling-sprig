/** 轻量 className 组合工具，避免在核心组件中拼接模板字符串。 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
