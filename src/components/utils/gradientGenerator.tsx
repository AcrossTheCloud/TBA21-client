const colors = ["#0076FF", "#9013FE", "#50E3C2"]

const sanitizeFocus = (focus: any): number => {
  if (typeof focus == 'string') {
    return parseInt(focus, 0);
  }

  if (typeof focus == 'number') {
    return Math.max(1, focus)
  }
  return 0
}

const generateFocusGradient = (
  focus_arts: any,
  focus_scitech: any,
  focus_action: any
): string => {

  let focuses: number[] = [
    sanitizeFocus(focus_arts),
    sanitizeFocus(focus_scitech),
    sanitizeFocus(focus_action)
  ]

  let generateGradient = (colorHex: string[]): string =>
    colorHex.join(", ")

  let totalFocus: number = focuses.reduce((acc, val) => acc + val, 0)

  let gradientColorString: string = ""

  switch (totalFocus) {
    case 0:
      gradientColorString = generateGradient(colors.reverse())
      break
    case 1:
      const activeIndex = focuses.findIndex(val => val === 1)
      const activeColor = colors[activeIndex]
      let newColors = colors.slice()
      newColors.splice(activeIndex, 0, activeColor)
      newColors.splice(activeIndex, 0, activeColor)
      newColors.splice(activeIndex, 0, activeColor)
      gradientColorString = generateGradient(newColors)
      break
    default:
      const focusColorMap: [number, string][] = [
        [focuses[0], colors[0]],
        [focuses[1], colors[1]],
        [focuses[2], colors[2]]
      ]
      let filteredColors: string[] = focusColorMap
        .filter(val => val[0] === 1)
        .map(val => val[1])

      gradientColorString  = generateGradient(filteredColors)

  }

  return `linear-gradient(to right, ${gradientColorString})`
}

export default generateFocusGradient
