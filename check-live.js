import axios from 'axios';

async function checkLive() {
  const r = await axios.get('https://inzfyer.in/');
  const match = r.data.match(/<script type="module" crossorigin src="(.*?)">/);
  if (match) {
    const r2 = await axios.get('https://inzfyer.in' + match[1]);
    console.log('Contains 1-4?', r2.data.includes('1-4 Days'));
    console.log('Contains 5-7?', r2.data.includes('5–7 Days') || r2.data.includes('5-7 Days'));
  }
}
checkLive();
