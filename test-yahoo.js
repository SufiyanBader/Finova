async function test() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/TATASTEEL.NS?interval=1d&range=1d');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
