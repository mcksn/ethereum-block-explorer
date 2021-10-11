const assert = require('assert');
const ganache = require("ganache-core");
const Web3 = require('web3');
const ReportingService = require('../reporting.service');
const contractFile = require('./resources/contracts/Test.json');

beforeEach(function() {
    web3 = new Web3(ganache.provider(), null, { transactionConfirmationBlocks: 0 , debug: true });
  });

describe('Reporting Service', () => {
    it('given contract deployed and transfer from same address', async () => {

        await deployContract(0)
        await sendTxn(0, '1000000000000000', 1)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 1000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 50);

    });
    
    it('given 2 contracts deployed only', async () => {

        await deployContract(0)
        await deployContract(0)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 0);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 1);
        assert.equal(reportingService.contractsCreatedCount(), 2);
        assert.equal(reportingService.contractTxnPercentage(), 100);


    });

    it('given two contracts deployed and transfer to one contract and transfer to another address', async () => {

        let contractAddress1 = await deployContract(0)
        let contractAddress2 = await deployContract(0)
        await sendTxn(0, '1000000000000000', 1)
        await sendTxnWithAddress(0, '1000000000000000', contractAddress2)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 2000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 3);
        assert.equal(reportingService.contractsCreatedCount(), 2);
        assert.equal(reportingService.contractTxnPercentage(), 75);

    });

    it('given contract deployed and transfer from different address', async () => {

        await deployContract(0)
        await sendTxn(1, '1000000000000000', 1)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 1000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 2);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 50);

    });

    it('given contract deployed and transfer to contract', async () => {

        let contractAddress = await deployContract(0)
        await sendTxnWithAddress(1, '1000000000000000', contractAddress)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 1000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 2);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 2); 
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 100);
        assert.equal(reportingService.addressReceivedEtherTotals().length, 1 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressReceivedEtherTotals(), 1000000000000000, true))
        assert.equal(reportingService.addressSentEtherTotals().length, 1 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 1000000000000000, false))

    });

    it('given contract deployed and 2 transfers from different address to same address', async () => {

        await deployContract(0)
        await sendTxn(2, '1000000000000000', 1)
        await sendTxn(3, '2000000000000000', 1)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 3000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 3);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 2); 
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reportingService.addressReceivedEtherTotals().length, 1 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressReceivedEtherTotals(), 3000000000000000, false))
        assert.equal(reportingService.addressSentEtherTotals().length, 2 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 2000000000000000, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 1000000000000000, false))

    });

    it('given contract deployed and 2 transfers from same address to same address', async () => {

        let contractAddress = await deployContract(0)
        await sendTxn(0, '1000000000000000', 1)
        await sendTxn(0, '2000000000000000', 1)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 3000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 2); 
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reportingService.addressReceivedEtherTotals().length, 1 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressReceivedEtherTotals(), 3000000000000000, false))
        assert.equal(reportingService.addressSentEtherTotals().length, 1 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 3000000000000000, false))

    });

    it('given contract deployed and 2 transfers from different address to different address', async () => {

        let contractAddress = await deployContract(0)
        await sendTxn(2, '1000000000000000', 3)
        await sendTxn(3, '2000000000000000', 4)
        let reportingService = new ReportingService();
        await reportingService.init(web3, 0)
        assert.equal(reportingService.etherTransferedInTotal(), 3000000000000000);
        assert.equal(reportingService.uniqueAddressSentTxnsCount(), 3);
        assert.equal(reportingService.uniqueAddressReceivedTxnsCount(), 3);
        assert.equal(reportingService.contractsCreatedCount(), 1);
        assert.equal(reportingService.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reportingService.addressReceivedEtherTotals().length, 2 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressReceivedEtherTotals(), 2000000000000000, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressReceivedEtherTotals(), 1000000000000000, false))
        assert.equal(reportingService.addressSentEtherTotals().length, 2 )
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 2000000000000000, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reportingService.addressSentEtherTotals(), 1000000000000000, false))
    });
    
});

const deployContract = async (accountNumber = 0) => {
    const accounts = await web3.eth.getAccounts();
    const deployAccount = accounts[accountNumber];
    const data = contractFile.bytecode;
    const gas = 4000000;
    const gasPrice = web3.utils.toWei('2', 'gwei');

    console.log('Attempting to deploy from account:', deployAccount);

    const result = await new web3.eth.Contract(contractFile.abi)
        .deploy({ data })
        .send({ gas, gasPrice, from: deployAccount });

    console.log('Contract deployed to', result.options.address);

    return result.options.address;

};

const sendTxn = async (accountNumberFrom, value, accountNumberTo) => {
    await web3.eth.sendTransaction({
        from: (await web3.eth.getAccounts())[accountNumberFrom],
        to: (await web3.eth.getAccounts())[accountNumberTo],
        value: value
    })
};

const sendTxnWithAddress = async (accountNumberFrom, value, addressTo) => {
    await web3.eth.sendTransaction({
        from: (await web3.eth.getAccounts())[accountNumberFrom],
        to: addressTo,
        value: value
    })
};

function entriesHasEtherTotalAndIsContract(entries, value, isContract) {
    return  [...entries.map(f =>  f[1])].filter(d => d.txnValue === value && d.isContract === isContract).length === 1
}
