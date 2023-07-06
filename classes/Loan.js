class Loan {
    constructor(originalLoan,totalAbaa,totalUmi,totalUAE,totalhouse,totalSwafia,Pay1,Pay2,Pay1Source,Pay2Source,loaner,projectOwner,date) {
        this.originalLoan = originalLoan;
        this.totalAbaa = totalAbaa;
        this.totalUmi = totalUmi;
        this.totalUAE = totalUAE;
        this.totalhouse = totalhouse;
        this.totalSwafia = totalSwafia;
        this.Pay1 = Pay1;
        this.Pay2 = Pay2;
        this.Pay1Source = Pay1Source;
        this.Pay2Source = Pay2Source;
        this.loaner = loaner;
        this.projectOwner=projectOwner
        this.date=date
    }

    async calculateRemaining(Pay1,Pay2,Pay1Source,Pay2Source,totalAbaa,totalUmi,totalUAE,totalhouse,totalSwafia)
    {
      console.log("pay1="+Pay1+" pay2="+Pay2+" for the project "+ this.projectOwner)
         this.totalPay=Pay1+Pay2
         if(Pay1Source=="Abaa")
         {
            this.totalAbaa+=Pay1
         }
         else if (Pay1Source=="Umi")
         {
            this.totalUmi+=Pay1
         }
         else if (Pay1Source=="UAE")
         {
                this.totalUAE+=Pay1
         }
         else if (Pay1Source=="Swafia")
         {
            this.totalSwafia+=Pay1
         }
         else if (Pay1Source=="house")
         {
            this.totalhouse+=Pay1
         }


         if(Pay2Source=="Abaa")
         {
            this.totalAbaa+=Pay2
         }
         else if (Pay2Source=="Umi")
         {
            this.totalUmi+=Pay2
         }
         else if (Pay2Source=="UAE")
         {
            this.totalUAE+=Pay2
         }
         else if (Pay2Source=="Swafia")
         {
            this.totalSwafia+=Pay2
         }
         else if (Pay2Source=="house")
         {
            this.totalhouse+=Pay2
         }

         this.total=this.totalhouse+this.totalSwafia+this.totalUAE+this.totalUmi+this.totalAbaa
         this.remaining=this.originalLoan-this.totalPay
         return true
    }
}

module.exports = Loan;