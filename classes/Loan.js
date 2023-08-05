class Loan {
   constructor(originalLoan, sources, value, source, loaner, projectOwner, date) {
      this.originalLoan = originalLoan;
      this.sources = sources
      this.value = value;
      this.source = source
      this.loaner = loaner;
      this.projectOwner = projectOwner
      this.date = date
   }

   async calculateRemaining() {
      this.remaining = this.originalLoan - this.value;
      if (!this.sources.hasOwnProperty(this.source)) {
         // Initialize the source to 0 if it doesn't exist
         this.sources[this.source] = 0;
      }
      this.sources[this.source] += this.value;
      this.sources["total"] += this.value;
      return true
   }
}

module.exports = Loan;