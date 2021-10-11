const ReportingService = require('./reporting.service');
const web3 = require('./web3').default;

var main = async function () {

    reportingService = new ReportingService();
    
    await reportingService.init(web3, process.argv[2], process.argv[3]);

    // How much Ether was transferred in total?
    console.log(`\nHow much Ether was transferred in total?\n${reportingService.etherTransferedInTotal()}`);

    // Which addresses received Ether and how much did they receive in total?
    console.log(`\nWhich addresses received Ether and how much did they receive in total?`);
    console.table(reportingService.addressReceivedEtherTotals().map(t => new tableRow(t[0], t[1].txnValue, t[1].isContract)));

    // Which addresses sent Ether and how much did they send in total?
    console.log(`\nWhich addresses sent Ether and how much did they send in total?`);
    console.table(reportingService.addressSentEtherTotals().map(t => new tableRow(t[0], t[1].txnValue, t[1].isContract)));

    // What percentage of transactions were contract transactions?
    console.log(`\nWhat percentage of transactions were contract transactions?\n${reportingService.contractTxnPercentage()}%`);

    // How many unique addresses sent transactions?
    console.log(`\nHow many unique addresses sent transactions?\n${reportingService.uniqueAddressSentTxnsCount()}`);

    // How many unique addresses received transactions?
    console.log(`\nHow many unique addresses received transactions?\n${reportingService.uniqueAddressReceivedTxnsCount()}`);

    //How many contracts were created?
    console.log(`\nHow many contracts were created?\n${reportingService.contractsCreatedCount()}`);
   
}

main();

function tableRow(address, value, is_contract) {
    this.address = address;
    this.value = value;
    this.is_contract = is_contract;
  }