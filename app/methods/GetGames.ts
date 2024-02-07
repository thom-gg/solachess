import { PublicKey, clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

import * as anchor from "@coral-xyz/anchor"
import idl from "../idl/idl.json"
import { defaultPubkey, programPubkey } from "../config";


export async function getWaitingGames() {
    const programId = new PublicKey(programPubkey);


    const network = clusterApiUrl("devnet");

    const connection = new Connection(network, {});

    // fake wallet
    const wallet = {
        signTransaction: () => Promise.reject(),
        signAllTransactions: () => Promise.reject(),
        publicKey: Keypair.generate().publicKey,
    }
    let provider: anchor.Provider

    try {
        provider = anchor.getProvider()
    } catch {
        provider = new anchor.AnchorProvider(connection, wallet, {})
        anchor.setProvider(provider)
    }
    const program = new anchor.Program(idl as anchor.Idl, programId)
    let res = await program.account.gameAccount.all([
        {
            memcmp: {
                offset: 9 + 8 + 32, //need to prepend 8 bytes for anchor's disc
                bytes: defaultPubkey,
            }
        },

    ]);

    return res;
    // console.log(res[0].publicKey.toString())
}

export async function getYourGames(userAddress: string) {
    const programId = new PublicKey(programPubkey);


    const network = clusterApiUrl("devnet");

    const connection = new Connection(network, {});


    // fake wallet
    const wallet = {
        signTransaction: () => Promise.reject(),
        signAllTransactions: () => Promise.reject(),
        publicKey: Keypair.generate().publicKey,
    }
    let provider: anchor.Provider

    try {
        provider = anchor.getProvider()
    } catch {
        provider = new anchor.AnchorProvider(connection, wallet, {})
        anchor.setProvider(provider)
    }
    const program = new anchor.Program(idl as anchor.Idl, programId);
    console.log("Before first get accounts");
    let res1 = await program.account.gameAccount.all([
        {
            memcmp: {
                offset: 8 + 9, //need to prepend 8 bytes for anchor's disc
                bytes: userAddress,
            }

        },
        {
            memcmp: {
                offset: 8 + 9 + 64,
                // winner should be defaultPubkey, if the game isnt over yet
                bytes: defaultPubkey,
            }
        }

    ]);
    let res2 = await program.account.gameAccount.all([
        {
            memcmp: {
                offset: 8 + 9 + 32, //need to prepend 8 bytes for anchor's disc
                bytes: userAddress,
            }
        },

    ]);
    console.log("before second get accounts");

    for (let i = 0; i < res2.length; i++) {
        let isInRes1 = false;
        for (let j = 0; j < res1.length; j++) {
            if (res1[j].publicKey.toString() === res2[i].publicKey.toString()) {
                isInRes1 = true;
                break;
            }
        }
        if (!isInRes1) {
            res1.push(res2[i]);
        }

    }




    return res1;
    // console.log(res[0].publicKey.toString())
}




