# Solachess
![a](https://github.com/thom-gg/solachess/blob/main/banner.png?raw=true)

### Description

This is a on-chain chess application on Solana, using Anchor framework. I wanted to start building on Solana and this idea came to my mind as an interesting project, to practice on multiple things, as well on the backend (smart contract) than on the frontend.

Solana's speed made it really interesting compared to other chains I could have done this on, because there is almost no latency between plays, so players can have a smooth experience.


### Technology 

The front-end uses Next.js framework.
The back-end uses Anchor framework, because of all the additional checks, and the ease to write programs it provides.

The different pages use event listeners from the solana/web3.js library, to catch changes on the blockchain as soon as they happen.

### How to use

You need a wallet to use the app. It has only been tested with [Phantom Wallet](https://phantom.app/), but should work with other Solana wallets too.
(You might have to set your wallet extension settings to devnet)

Anyone can create as many games as they want, it creates a new Solana account to store the data, so the creator of the game has to pay rent for it (it is on devnet anyways).
After someone joined the game, you can go on your game's page to play !

### What's missing

Basic rules are implemented for now, you must eat the king to end the game, it doesnt notice a checkmate situation yet.

Mechanics to implement:
- en-passant 
- castling 
- promotion 
- prevent moves that put you in check
- detect checkmate situation


### Credits

Chess pieces assets are from chess.com, with modified colors.

The basic of the chessboard rendering (in the frontend), comes from [FrontendCodingYT's repo](https://github.com/FrontendCodingYT/coding-projects 'Link to repo')
