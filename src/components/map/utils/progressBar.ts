export function progressBar(progress: number, total: number, elapsedTime?: number) {
  const wrapper = document.getElementById('progressWrapper');
  const bar = document.getElementById('progressBar');

  console.log(progress, total, elapsedTime);

  // Update the loading progress bar
  if (bar && wrapper) {
    if (progress === total) {
      // all markers processed - hide the progress bar:
      wrapper.style.display = 'none';
      wrapper.style.zIndex = '0';
      bar.innerText = '0%';
    } else {
      const percentage = Math.round(progress / total * 100);
      wrapper.style.display = 'block';
      wrapper.style.zIndex = '400';
      bar.style.width = percentage + '%';
      bar.innerText = percentage + '%';
    }
  }
}
