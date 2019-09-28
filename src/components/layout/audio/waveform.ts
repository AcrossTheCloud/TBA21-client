export const waveFormData = async () => {
  const file =  await fetch('https://prod-content.ocean-archive.org/waveform6.json');
  const json = await file.json();

  if (json) {
    return json.data;
  }
};
