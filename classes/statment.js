class Statement {
  constructor(loans, value, source, giver, taker, purpose, date, remainingTotal, totalPaid, actionType) {
    this.loans = loans;
    this.value = value;
    this.source = source;
    this.giver = giver;
    this.taker = taker;
    this.remainingTotal = remainingTotal;
    this.purpose = purpose
    this.totalPaid = totalPaid;
    this.shlingFactor = 0
    this.date = date;
    this.cashShling = 0
    this.actionType = actionType
   }

  async calculateRemainingLoan() {
    if (this.actionType === "cash out") {
      this.remaining=this.loans
      this.remaining[this.taker] -= this.value;
      this.remainingTotal -= this.value;
      this.totalPaid += this.value;
    }
    else if (this.actionType==="cash in")
    {
      this.remaining=this.loans
      this.remaining[this.taker] -= this.value;
      this.remaining[this.giver] += this.value;
    }

   
    return true;
  }

  async totalpaying() {
    console.log("calculating paying");
    if (this.actionType === "cash in"&&this.source==='UAE') {
      await this.calculateShlingAED()
      this.value=this.cashShling
    }
    else if (this.actionType === "cash out" && this.source === "cash") {

      await this.calculateShlingSAR();
      this.value = this.cashShling
    }


    return true;
  }

  async calculateShlingSAR() {
    console.log("calculating shling");
    await this.getShlingFactorSAR();
    this.cashShling = parseInt(this.value * this.shlingFactor);
    console.log("cash is " + this.value + " factor is " + this.shlingFactor + " shling is " + this.cashShling);
    return true;
  }

  async getShlingFactorSAR() {
    console.log("calculating factor");
    const apiKey = '9179c0f0f66c44909ffeb3444ab800dc';
    const fromCurrency = 'SAR';
    const toCurrency = 'KES';

    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=${toCurrency},${fromCurrency}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Error: ${data.error.message}`);
    }

    this.shlingFactor = data.rates[fromCurrency] * 10;
    console.log(this.shlingFactor)
    return true;
  }

  async calculateShlingAED() {
    console.log("calculating shling");
    await this.getShlingFactorAED();
    this.cashShling = parseInt(this.value * this.shlingFactor);
    console.log("cash is " + this.value + " factor is " + this.shlingFactor + " shling is " + this.cashShling);
    return true;
  }

  async getShlingFactorAED() {
    console.log("calculating factor");
    const apiKey = '9179c0f0f66c44909ffeb3444ab800dc';
    const fromCurrency = 'AED';
    const toCurrency = 'KES';

    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=${toCurrency},${fromCurrency}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Error: ${data.error.message}`);
    }

    this.shlingFactor = data.rates[fromCurrency];
    console.log(this.shlingFactor)
    return true;
  }
}



module.exports = Statement;