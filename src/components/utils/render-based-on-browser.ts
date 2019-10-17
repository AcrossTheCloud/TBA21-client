import { browser } from './browser';
export default function renderForBrowser(value) {
  const browserValue: string = browser();

  if (browserValue === 'ie6-11') {
    return value.split('\n').map((d, i) => d);
  } else {
    return value;
  }
}
