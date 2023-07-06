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
            this.totalAbaa+=totalAbaa
         }
         else if (Pay1Source=="Umi")
         {
            this.totalUmi+=totalUmi
         }
         else if (Pay1Source=="UAE")
         {
                this.totalUAE+=totalUAE
         }
         else if (Pay1Source=="Swafia")
         {
            this.totalSwafia+=totalSwafia
         }
         else if (Pay1Source=="House")
         {
            this.totalhouse+=totalhouse
         }


         if(Pay2Source=="Abaa")
         {
            this.totalAbaa+=totalAbaa
         }
         else if (Pay2Source=="Umi")
         {
            this.totalUmi+=totalUmi
         }
         else if (Pay2Source=="UAE")
         {
            this.totalUAE+=totalUAE
         }
         else if (Pay2Source=="Swafia")
         {
            this.totalSwafia+=totalSwafia
         }
         else if (Pay2Source=="House")
         {
            this.totalhouse+=totalhouse
         }

         this.total=this.totalhouse+this.totalSwafia+this.totalUAE+this.totalUmi+this.totalAbaa
         this.remaining=this.originalLoan-this.totalPay
         return true
    }
}

module.exports = Loan;