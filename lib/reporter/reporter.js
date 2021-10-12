/* aggregates and reports on txns within ethereum blocks */
function Reporter() {
    const contractTxns = new Set();
    const newContractTxns = new Set();
    const contractAddresses = new Set();
    const addressSender = new Set();
    const addressReceiver = new Set();
    const txnEthers = new Array();
    const addressReceiverEtherMap = new Map();
    const addressSenderEtherMap = new Map();
    const txns = new Array();

    return {
        init: async function (web3, blockStart, blockEnd) {
            for (i = blockStart; i <= (blockEnd || await web3.eth.getBlockNumber()); i++) {
                await aggregate(web3, await findTransactions(web3, i));
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

    /* aggregate transactions and append to existing data structures ready for reporting*/
    async function aggregate(web3, _txns) {
        for (let txn of _txns) {
            txns.push(txn);
            let txnValue = weiToEther(web3, txn.value);

            if (txn.to === null && (await web3.eth.getTransactionReceipt(txn.hash)).contractAddress !== null) {
                newContractTxns.add(txn.hash);
                contractTxns.add(txn.hash);
            }

            if (txn.to !== null && '0x' !== await web3.eth.getCode(txn.to)) {
                contractTxns.add(txn.hash);
                contractAddresses.add(txn.to)
            }

            if ('0x' !== await web3.eth.getCode(txn.from)) {
                contractTxns.add(txn.hash);
                contractAddresses.add(txn.from)
            }

            if (0 !== txnValue) {
                if (addressReceiverEtherMap.has(txn.to)) {
                    addressReceiverEtherMap.get(txn.to).txnValue = addressReceiverEtherMap.get(txn.to).txnValue + txnValue;
                } else {
                    addressReceiverEtherMap.set(txn.to, { txnValue: txnValue, isContract: contractAddresses.has(txn.to) });
                }
                if (addressSenderEtherMap.has(txn.from)) {
                    addressSenderEtherMap.get(txn.from).txnValue = addressSenderEtherMap.get(txn.from).txnValue + txnValue;
                } else {
                    addressSenderEtherMap.set(txn.from, { txnValue: txnValue, isContract: contractAddresses.has(txn.from) });
                }
            }

            addressSender.add(txn.from);
            addressReceiver.add(txn.to);

            txnEthers.push(txnValue);

        }
    }
    async function findTransactions(web3, blockNumber) {
        return web3.eth.getBlock(blockNumber, true)
            .then(block => block.transactions)
    };

    function weiToEther(web3, wei) {
        return Number(web3.utils.fromWei(wei, "ether"))
    }
}

function add(accumulator, a) {
    return accumulator + a;
}

module.exports = Reporter;
