const ReportingService = require('./reporting.service');
const { web3 } = require('./web3');

var main = async function () {

    reportingService = new ReportingService();
    await reportingService.init(web3, process.argv[2], process.argv[3]);

    // console.log(`\ncontractAdresses\n${[...contractAdresses.values()]}`);
    // console.log(`\nnewContractTxns\n${[...newContractTxns.values()]}`);
    // console.log(`\naddressSender\n${[...addressSender.values()]}`);
    // console.log(`\naddressReceiver\n ${[...addressReceiver.values()]}`);
    // console.log(`\ntxnEthers\n${txnEthers}`);
    // console.log(`\naddressReceiverEtherMap\n${[...addressReceiverEtherMap.values()]}`);
    // console.log(`\naddressSenderEtherMap\n${[...addressSenderEtherMap.values()]}`);

    // How much Ether was transferred in total?
        console.log(`\nHow much Ether was transferred in total?\n${reportingService.etherTransferedInTotal()}`);

    // Which addresses received Ether and how much did they receive in total?
    console.log(`\nWhich addresses received Ether and how much did they receive in total?\n${prettyStringArray(reportingService.addressReceivedEtherTotals())}`);

    // Which addresses sent Ether and how much did they send in total?
    console.log(`\nWhich addresses sent Ether and how much did they send in total?\n${prettyStringArray(reportingService.addressSentEtherTotals())}`);
    // Of these addresses, which are contract addresses?

    // console.log(`\nOf these addresses, which are contract addresses?\n${prettyStringArray([...addressesSenderAndReceiver.filter(x => contractAdresses.has(x))])}`);

    // What percentage of transactions were contract transactions?
    // const totalTxns = txns.length;
    // const totalContractTxns = txns.filter(txn => contractAdresses.has(txn.to) || contractAdresses.has(txn.from)).length;
    console.log(`\nWhat percentage of transactions were contract transactions?\n${reportingService.contractTxnPercentage()}%`);

    // How many uncles were there?

    // How many unique addresses sent transactions?
    console.log(`\nHow many unique addresses sent transactions?\n${reportingService.uniqueAddressSentTxnsCount()}`);

    // How many unique addresses received transactions?
    console.log(`\nHow many unique addresses received transactions?\n${reportingService.uniqueAddressReceivedTxnsCount()}`);

    // How many contracts were created?
    console.log(`\nHow many contracts were created?\n${reportingService.contractsCreatedCount()}`);

    // How many events were fired in total?

}

main();

function prettyStringArray(array) {
    strBuilder = "";
    array.forEach(item => strBuilder += `\n${item}`);
    return strBuilder;
}
