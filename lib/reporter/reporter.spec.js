const assert = require('assert');
const ganache = require("ganache-core");
const Web3 = require('web3');
const Reporter = require('./reporter');
const contractFile = require('./Test.json');

const ONE_ETH_IN_WEI = "1000000000000000000";
const TWO_ETH_IN_WEI = "2000000000000000000";

beforeEach(function () {
    web3 = new Web3(ganache.provider(), null, { transactionConfirmationBlocks: 0, debug: true });
});

/* Tests the reporter by using an embedded blockchain which is configured to create a block per transaction.
Uses a compiled contract (Test) to simulate contract deployments.*/
describe('Reporter', () => {

    it('given contract deployed and transfer from same address', async () => {

        await deployContract(0)
        await sendTxn(0, ONE_ETH_IN_WEI, 1)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 1);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 50);

    });

    it('given four blocks each with transaction ask for three blocks', async () => {

        // first block is empty
        await deployContract(0)
        await sendTxn(0, ONE_ETH_IN_WEI, 1)
        await sendTxn(0, ONE_ETH_IN_WEI, 1)
        let reporter = new Reporter();
        await reporter.init(web3, 0, 2)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 1);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 50);

    });

    it('given 2 contracts deployed only', async () => {

        await deployContract(0)
        await deployContract(0)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 0);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 1);
        assert.equal(reporter.contractsCreatedCount(), 2);
        assert.equal(reporter.contractTxnPercentage(), 100);
    });

    it('given two contracts deployed and transfer to one contract and transfer to another address', async () => {

        let contractAddress1 = await deployContract(0)
        let contractAddress2 = await deployContract(0)
        await sendTxn(0, ONE_ETH_IN_WEI, 1)
        await sendTxnWithAddress(0, ONE_ETH_IN_WEI, contractAddress2)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 2);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 3);
        assert.equal(reporter.contractsCreatedCount(), 2);
        assert.equal(reporter.contractTxnPercentage(), 75);

    });

    it('given contract deployed and transfer from different address', async () => {

        await deployContract(0)
        await sendTxn(1, ONE_ETH_IN_WEI, 1)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 1);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 2);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 50);

    });

    it('given contract deployed and transfer to contract', async () => {

        let contractAddress = await deployContract(0)
        await sendTxnWithAddress(1, ONE_ETH_IN_WEI, contractAddress)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 1);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 2);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 100);
        assert.equal(reporter.addressReceivedEtherTotals().length, 1)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressReceivedEtherTotals(), 1, true))
        assert.equal(reporter.addressSentEtherTotals().length, 1)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 1, false))

    });

    it('given contract deployed and 2 transfers from different address to same address', async () => {

        await deployContract(0)
        await sendTxn(2, ONE_ETH_IN_WEI, 1)
        await sendTxn(3, TWO_ETH_IN_WEI, 1)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 3);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 3);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reporter.addressReceivedEtherTotals().length, 1)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressReceivedEtherTotals(), 3, false))
        assert.equal(reporter.addressSentEtherTotals().length, 2)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 2, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 1, false))

    });

    it('given contract deployed and 2 transfers from same address to same address', async () => {

        let contractAddress = await deployContract(0)
        await sendTxn(0, ONE_ETH_IN_WEI, 1)
        await sendTxn(0, TWO_ETH_IN_WEI, 1)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 3);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 1);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 2);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reporter.addressReceivedEtherTotals().length, 1)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressReceivedEtherTotals(), 3, false))
        assert.equal(reporter.addressSentEtherTotals().length, 1)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 3, false))

    });

    it('given contract deployed and 2 transfers from different address to different address', async () => {

        let contractAddress = await deployContract(0)
        await sendTxn(2, ONE_ETH_IN_WEI, 3)
        await sendTxn(3, TWO_ETH_IN_WEI, 4)
        let reporter = new Reporter();
        await reporter.init(web3, 0)
        //then
        assert.equal(reporter.etherTransferedInTotal(), 3);
        assert.equal(reporter.uniqueAddressSentTxnsCount(), 3);
        assert.equal(reporter.uniqueAddressReceivedTxnsCount(), 3);
        assert.equal(reporter.contractsCreatedCount(), 1);
        assert.equal(reporter.contractTxnPercentage(), 33.33333333333333);
        assert.equal(reporter.addressReceivedEtherTotals().length, 2)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressReceivedEtherTotals(), 2, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressReceivedEtherTotals(), 1, false))
        assert.equal(reporter.addressSentEtherTotals().length, 2)
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 2, false))
        assert.ok(entriesHasEtherTotalAndIsContract(reporter.addressSentEtherTotals(), 1, false))
    });

});

const deployContract = async (accountNumber = 0) => {
    const accounts = await web3.eth.getAccounts();
    const deployAccount = accounts[accountNumber];
    const data = contractFile.bytecode;
    const gas = 4000000;
    const gasPrice = web3.utils.toWei('2', 'gwei');

    console.log('Attempting to deploy from account: ', deployAccount);

    const result = await new web3.eth.Contract(contractFile.abi)
        .deploy({ data })
        .send({ gas, gasPrice, from: deployAccount });

    console.log('Contract deployed to: ', result.options.address);

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
    return [...entries.map(f => f[1])]
        .filter(d => d.txnValue === value && d.isContract === isContract).length === 1
}
