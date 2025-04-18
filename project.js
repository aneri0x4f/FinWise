document.addEventListener("DOMContentLoaded", () => {
    fetchCurrencies();
  
    document.getElementById("convertBtn").addEventListener("click", convert);
  });
  
  async function fetchCurrencies() {
    try {
    const response = await fetch("https://api.exchangerate.host/latest");
    const data = await response.json();
        
      const currencies = Object.keys(data.rates);
  
      const fromCurrencySelect = document.getElementById("fromCurrency");
      const toCurrencySelect = document.getElementById("toCurrency");
  
      currencies.forEach(currency => {
        const option1 = new Option(currency, currency);
        const option2 = new Option(currency, currency);
        fromCurrencySelect.add(option1.cloneNode(true));
        toCurrencySelect.add(option2.cloneNode(true));
      });
  
      fromCurrencySelect.value = "USD";
      toCurrencySelect.value = "INR";
    } catch (err) {
      console.error("Failed to fetch currencies", err);
      document.getElementById("error").textContent = "Could not load currency list.";
    }
  }
  
  
  async function convert() {
    const amount = parseFloat(document.getElementById("amount").value);
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;
  
    const resultDiv = document.getElementById("result");
    const errorDiv = document.getElementById("error");
  
    if (isNaN(amount) || amount <= 0) {
      errorDiv.innerText = "Please enter a valid amount.";
      resultDiv.innerText = "";
      return;
    }
  
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
      const data = await response.json();
  
      if (!data.rates[toCurrency]) {
        throw new Error("Invalid currency selected.");
      }
  
      const convertedAmount = (amount * data.rates[toCurrency]).toFixed(2);
  
      resultDiv.innerHTML = `${amount} ${fromCurrency} = <strong>${convertedAmount} ${toCurrency}</strong>`;
      errorDiv.innerHTML = "";
    } catch (error) {
      console.error("Conversion error:", error);
      resultDiv.innerHTML = "";
      errorDiv.innerHTML = "Error fetching exchange rates. Please try again later.";
    }
  }
  