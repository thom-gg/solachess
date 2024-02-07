import styles from '../styles/Home.module.css';
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import idl from "../idl/idl.json"
import { programPubkey } from '../config';





export default function CreateNewGame() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    const wallet = useAnchorWallet();

    const createGame = useCallback(async () => {
        let provider: anchor.Provider

        try {
            provider = anchor.getProvider()
        } catch {
            provider = new anchor.AnchorProvider(connection, wallet, {})
            anchor.setProvider(provider)
        }

        let programId = new PublicKey(programPubkey);
        const program = new anchor.Program(idl as anchor.Idl, programId);

        let [configPublicKey, configBump] = PublicKey.findProgramAddressSync([Buffer.from("GLOBAL_INFO")], programId);

        console.log("Pda Public Key = " + configPublicKey);

        let configData = await program.account.globalInfo.fetch(configPublicKey);
        let lastGameId = (configData.lastGameId as anchor.BN).toNumber();

        let [gameAccountPubKey, gameAccountBump] = PublicKey.findProgramAddressSync([Buffer.from("GAME"), new anchor.BN(lastGameId + 1).toArrayLike(Buffer, "be", 8)], programId);



        try {
            const ix = await program.methods
                .createGame()
                .accounts({
                    globalInfoAccount: configPublicKey,
                    signer: wallet.publicKey,
                    gameAccount: gameAccountPubKey,
                    systemProgram: SystemProgram.programId
                })
                .instruction();

            let tx = new anchor.web3.Transaction();
            tx.add(ix);
            console.log("Sending tx: ");
            console.log(tx);
            const resTx = await sendTransaction(tx, connection)
            console.log("after resTx");
            console.log(resTx);
        }
        catch (e) {
            console.log(e);
        }



        // setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`)
    }, [])
    return (
        <button className={styles.createGameButton} onClick={() => createGame()}>
            Create new game
        </button>
    )
}