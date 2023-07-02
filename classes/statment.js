class Statement {
    constructor(abaaLoan, umiLoan, abaaIn, umiIn, rent, cash, abaaPercentage, umiPercentage, abaaOut, umiOut, date) {
        this.abaaLoan = abaaLoan;
        this.umiLoan = umiLoan;
        this.abaaIn = abaaIn;
        this.umiIn = umiIn;
        this.rent = rent;
        this.cash = cash;
        this.cashShling = null;
        this.abaaPercentage = abaaPercentage;
        this.umiPercentage = umiPercentage;
        this.total = null;
        this.abaaOut = abaaOut;
        this.umiOut = umiOut;
        this.abaaTotal =0;
        this.umiTotal = 0;
        this.remainingAbaa = null;
        this.remainingUmi = null;
        this.remainingTotal = null;
        this.shlingFactor=null
        this.date = date;

    }

    async calculateRemainingLoan() {
        await this.totalpaying();
        await this.netMoney("abaa");
        await this.netMoney("umi");
        
        this.remainingAbaa = this.abaaLoan - (this.total * this.abaaPercentage)+this.abaaIn;
        this.remainingUmi = this.umiLoan - (this.total * this.umiPercentage)+this.umiIn;
        this.remainingTotal = this.remainingAbaa + this.remainingUmi;
        return true;
      }
      
      async netMoney(loaner) {
        console.log("calculating net money");
        console.log("the precentage is  is "+ this.abaapercentage)
        if (loaner == "abaa") {
          this.abaaTotal += (this.total * this.abaaPercentage)-this.abaaOut;
        } else if (loaner == "umi") {
          this.umiTotal += (this.total * this.umiPercentage)-this.umiOut;
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
        this.cashShling = this.cash * this.shlingFactor;
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
        
        this.shlingFactor = data.rates[toCurrency];
        return true;
      }
}

module.exports = Statement;