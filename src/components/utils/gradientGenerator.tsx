const focusColorMap = {
  arts: "#0076FF",
  sciTech: "#9013FE",
  action: "#50E3C2"
}

const sanitizeFocus = (focus: any): number => {
  if (typeof focus === 'string') {
    return parseInt(focus, 0);
  }
  return 0
}

const generateFocusGradient = (
  focus_arts: any,
  focus_scitech: any,
  focus_action: any
): string => {

  const gradientMap: [number, string][] = [
    [sanitizeFocus(focus_arts), focusColorMap.arts],
    [sanitizeFocus(focus_scitech), focusColorMap.sciTech],
    [sanitizeFocus(focus_action), focusColorMap.action]
  ]

  const filteredGradientColors: string[] = gradientMap
    .filter(gradMap => gradMap[0] == 1)
    .map(gradMap => gradMap[1])



  if (filteredGradientColors.length === 1) {
    return filteredGradientColors[0]
  }

  let gradientColorString: string = filteredGradientColors
    .map((color, idx) => `${color} ${idx / filteredGradientColors.length}%`)
    .join(", ")



  console.log(`linear-gradient(to right, ${gradientColorString})`)
  return `linear-gradient(to right, ${gradientColorString})`
}

export default generateFocusGradient
