import { FC, useCallback, useEffect, useState } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getWaitingGames, getYourGames } from "../methods/GetGames";
import styles from '../styles/Home.module.css';
import { shortenPubkey } from "../methods/utils";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/idl.json"
import { programPubkey } from "../config";
import gamesStyle from '../styles/gamesStyle.module.css';
import { useRouter } from "next/navigation";




export const WaitingGames: FC = () => {
    const [games, setGames] = useState(null);

    const router = useRouter();

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    useEffect(() => {
        if (games == null) {
            getWaitingGames().then(res => {
                setGames(res);
            });

        }



    });

    const joinGame = useCallback(async (gameId: number) => {
        let provider: anchor.Provider

        try {
            provider = anchor.getProvider()
        } catch {
            provider = new anchor.AnchorProvider(connection, wallet, {})
            anchor.setProvider(provider)
        }

        let programId = new PublicKey(programPubkey);
        const program = new anchor.Program(idl as anchor.Idl, programId);

        let [gameAccountPubKey, gameAccountBump] = PublicKey.findProgramAddressSync([Buffer.from("GAME"), new anchor.BN(gameId).toArrayLike(Buffer, "be", 8)], programId);
        const latestBlockHash = await provider.connection.getLatestBlockhash();

        try {
            const ix = await program.methods
                .joinGame(new anchor.BN(gameId))
                .accounts({
                    gameAccount: gameAccountPubKey,
                    signer: wallet.publicKey,
                })
                .instruction();

            let tx = new anchor.web3.Transaction();
            tx.add(ix);
            console.log("Sending tx: ");
            console.log(tx);
            const resTx = await sendTransaction(tx, connection);
            console.log("after resTx");
            console.log(resTx);
            router.push("/games/" + gameId)
        }
        catch (e) {
            console.log(e);
        }



        // setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`)
    }, [])


    return (
        <div className={gamesStyle.container} >
            <h1 >Join games</h1>
            <div className={gamesStyle.separationLine}> </div>
            <div className={gamesStyle.listContainer} >
                {games ? games.map((game) =>
                    <>

                        <div key={game.account.id.toNumber()} className={gamesStyle.singleGame}>
                            <img src="../assets/preview.png" />
                            <div className={gamesStyle.gameInfos}>
                                <div className={gamesStyle.gameActions}>
                                    <p style={{ color: "white" }}>Game #{game.account.id.toNumber()}</p>

                                    <button onClick={() => joinGame(game.account.id.toNumber())}>Join</button>
                                </div>
                                <div className={gamesStyle.gamePlayers}>
                                    <p style={{ color: "#ba9ffb" }}>{shortenPubkey(game.account.playerWhite.toString())}</p>
                                    <p style={{ fontWeight: "bold" }}>vs</p>
                                    <p style={{ color: "black" }}>????????</p>
                                </div>

                            </div>

                        </div>
                    </>
                )
                    :
                    <></>}


            </div>

        </div >
    )
}
