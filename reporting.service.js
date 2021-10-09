const reducer = (previousValue, currentValue) => previousValue + currentValue;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


function ReportingService() {
    const contractTxns = new Set();
    const newContractTxns = new Set();
    const addressSender = new Set();
    const addressReceiver = new Set(); // bug, not stroing null values, which should is sometimes treated as zero address
    const txnEthers = new Array();
    const addressReceiverEtherMap = new Map();
    const addressSenderEtherMap = new Map();
    const txns = new Array();
    return {
        init: async function (web3, blockStart, blockEnd) {
            for (i = blockStart; i <= (blockEnd || await web3.eth.getBlockNumber()); i++) {
                console.debug(`BLOCK:${i} ::::::::::`)
                await store(web3, await findTransactions(web3, i));
            }
        },

        etherTransferedInTotal: function () {
            return txnEthers.reduce(add, 0);
        },

        addressReceivedEtherTotals: function () {
            return [...addressReceiverEtherMap.entries()];
        },

        addressSentEtherTotals: function () {
            return [...addressSenderEtherMap.entries()];
        },

        contractTxnPercentage: function () {
            const totalTxns = txns.length;
            return (contractTxns.size / txns.length) * 100;
        },

        uniqueAddressSentTxnsCount: function () {
            return addressSender.size;
        },

        /* treating 'null' as an address in its own right */
        uniqueAddressReceivedTxnsCount: function () {
            return addressReceiver.size;
        },

        contractsCreatedCount: function () {
            return newContractTxns.size;
        }
    };

    async function store(web3, _txns) {
        for (let txn of _txns) {
            txns.push(txn);
            let txnValue = parseInt(txn.value, '10');

            if (txn.to === null && (await web3.eth.getTransactionReceipt(txn.hash)).contractAddress !== null) {
                newContractTxns.add(txn.hash);
                contractTxns.add(txn.hash);
            }

            // console.log(txn)
            if (txn.to !== null && '0x' !== await web3.eth.getCode(txn.to)) { // to contracts
                contractTxns.add(txn.hash);
            }

            if ('0x' !== await web3.eth.getCode(txn.from)) {
                contractTxns.add(txn.hash);
            }

            if (0 !== txnValue) {
                if (addressReceiverEtherMap.has(txn.to)) {
                    addressReceiverEtherMap.set(txn.to, addressReceiverEtherMap.get(txn.to) + txnValue);
                } else {
                    addressReceiverEtherMap.set(txn.to, txnValue);
                }
                if (addressSenderEtherMap.has(txn.from)) {
                    addressSenderEtherMap.set(txn.from, addressSenderEtherMap.get(txn.from) + txnValue);
                } else {
                    addressSenderEtherMap.set(txn.from, txnValue);
                }
            }

            addressSender.add(txn.from);
            addressReceiver.add(txn.to);

            txnEthers.push(parseInt(txn.value, '10'));

        }
    }
    async function findTransactions(web3, blockNumber) {
        return web3.eth.getBlock(blockNumber, true)
            .then(block => block.transactions)
    };

}

function add(accumulator, a) {
    return accumulator + a;
}

module.exports = ReportingService;