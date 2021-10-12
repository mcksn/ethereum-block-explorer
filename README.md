# ethereum-block-explorer

## purpose
Explore a range of blocks on ethereum and answer interesting questions about it.

## dependecies
node (version 10.15.0+)

## run tests
`npm test`

## run application
`node index.js {block number start} {block number end}`
Will explore and report on data within blocks between {block number start} and {block number end}

where {block number start} <= {block number end}

Example: `node index.js 627911 6627917`

OR

`node index.js {block number start}`
Which will explore and report on data within blocks between {block number start} and lastest block.

Example: `node index.js 6627917`

You can also run the application by making `index.js` file executable and running `./index.js {block number start} {block number end}`