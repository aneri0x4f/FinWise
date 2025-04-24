export async function fetchCurrencies() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    const currencies = Object.keys(data.rates);

    const fromSelect = document.getElementById("fromCurrency");
    const toSelect = document.getElementById("toCurrency");

    currencies.forEach(currency => {
      const opt1 = new Option(currency, currency);
      const opt2 = new Option(currency, currency);
      fromSelect.add(opt1.cloneNode(true));
      toSelect.add(opt2.cloneNode(true));
    });

    fromSelect.value = "USD";
    toSelect.value = "INR";
  } catch {
    document.getElementById("error").innerText = "Could not load currencies.";
  }
}

export async function convert() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("error").innerText = "Enter a valid amount.";
    return;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    document.getElementById("result").innerHTML = `${amount} ${from} = <strong>${converted} ${to}</strong>`;
  } catch {
    document.getElementById("error").innerText = "Conversion failed.";
  }
}
