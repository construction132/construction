class Statement {
    constructor(abaaLoan, umiLoan, abaaIn, umiIn, rent, cash, abaaLoneDecrease, umiLoneDecrease, abaaOut, umiOut, date,abaaTotal,umiTotal) {
        this.abaaLoan = abaaLoan;
        this.umiLoan = umiLoan;
        this.abaaIn = abaaIn;
        this.umiIn = umiIn;
        this.rent = rent;
        this.cash = cash;
        this.cashShling = 0;
        this.abaaLoneDecrease = abaaLoneDecrease;
        this.umiLoneDecrease = umiLoneDecrease;
        this.total = 0;
        this.abaaOut = abaaOut;
        this.umiOut = umiOut;
        this.abaaTotal =abaaTotal;
        this.umiTotal = umiTotal;
        this.remainingAbaa = 0;
        this.remainingUmi = 0;
        this.remainingTotal = 0;
        this.shlingFactor=0
        this.date = date;

    }

    async calculateRemainingLoan() {
        await this.totalpaying();
        await this.netMoney("abaa");
        await this.netMoney("umi");
        
        this.remainingAbaa = parseInt(this.abaaLoan - (this.abaaLoneDecrease)+this.abaaIn);
        this.remainingUmi = parseInt(this.umiLoan - (this.umiLoneDecrease)+this.umiIn);
        this.remainingTotal = this.remainingAbaa + this.remainingUmi;
        return true;
      }
      
      async netMoney(loaner) {
        console.log("calculating net money");
        console.log("abaadecrese is "+this.abaaLoneDecrease+"and abaa out is "+ this.abaaOut)
        if (loaner == "abaa") {
          this.abaaTotal += parseInt((this.abaaLoneDecrease)-this.abaaOut);
        } else if (loaner == "umi") {
          this.umiTotal += parseInt((this.umiLoneDecrease)-this.umiOut);
        }
        return true;
      }
      
      async totalpaying() {
        console.log("calculating total");
        await this.calculateShling();
        this.total = this.rent + this.cashShling;
        return true;
      }
      
      async calculateShling() {
        console.log("calculating shling");
        await this.getShlingFactor();
        this.cashShling = parseInt(this.cash * this.shlingFactor);
        console.log("cash is " + this.cash + " factor is " + this.shlingFactor + " shling is " + this.cashShling);
        return true;
      }
      
      async getShlingFactor() {
        console.log("calculating factor");
        const apiKey = '9179c0f0f66c44909ffeb3444ab800dc';
        const fromCurrency = 'SAR';
        const toCurrency = 'KES';
        
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=${toCurrency},${fromCurrency}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Error: ${data.error.message}`);
        }
        
        this.shlingFactor = data.rates[fromCurrency]*10;
        console.log(this.shlingFactor)
        return true;
      }
}

module.exports = Statement;