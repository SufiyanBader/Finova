const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/TWELVE_DATA_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;
console.log("API Key found:", !!apiKey);
async function test() {
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent("TATASTEEL:NSE")}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("TATASTEEL:NSE", data);

  const url2 = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent("TATASTEEL.NS")}&apikey=${apiKey}`;
  const res2 = await fetch(url2);
  const data2 = await res2.json();
  console.log("TATASTEEL.NS", data2);
  
  const url3 = `https://api.twelvedata.com/quote?symbol=TATASTEEL&exchange=NSE&apikey=${apiKey}`;
  const res3 = await fetch(url3);
  const data3 = await res3.json();
  console.log("TATASTEEL exchange=NSE", data3);
}
test();
