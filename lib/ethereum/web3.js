const Web3  = require('web3');
require('dotenv').config();

const provider = new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJ_ID}`);

module.exports = new Web3(provider);