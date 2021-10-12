#!/usr/bin/env node

const Reporter = require('./lib/reporter/reporter');
const web3 = require('./lib/ethereum/web3');

var main = async function () {

    reporter = new Reporter();

    await reporter.init(web3, process.argv[2], process.argv[3]);

    // How much Ether was transferred in total?
    console.log(`\nHow much ETH was transferred in total?\n${reporter.etherTransferedInTotal()}`);

    // Which addresses received Ether and how much did they receive in total?
    console.log(`\nWhich addresses received ETH and how much did they receive in total?`);
    console.table(reporter.addressReceivedEtherTotals().map(t => new tableRow(t[0], t[1].txnValue, t[1].isContract)));

    // Which addresses sent Ether and how much did they send in total?
    console.log(`\nWhich addresses sent ETH and how much did they send in total?`);
    console.table(reporter.addressSentEtherTotals().map(t => new tableRow(t[0], t[1].txnValue, t[1].isContract)));

    // What percentage of transactions were contract transactions?
    console.log(`\nWhat percentage of transactions were contract transactions?\n${reporter.contractTxnPercentage()}%`);

    // How many unique addresses sent transactions?
    console.log(`\nHow many unique addresses sent transactions?\n${reporter.uniqueAddressSentTxnsCount()}`);

    // How many unique addresses received transactions?
    console.log(`\nHow many unique addresses received transactions?\n${reporter.uniqueAddressReceivedTxnsCount()}`);

    //How many contracts were created?
    console.log(`\nHow many contracts were created?\n${reporter.contractsCreatedCount()}`);

}

main();

function tableRow(address, ether, is_contract) {
    this.address = address;
    this.ETH = ether;
    this.is_contract = is_contract;
}