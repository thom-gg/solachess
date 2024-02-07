import { FC, useEffect, useState } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"
import { useWallet } from "@solana/wallet-adapter-react";
import { getYourGames } from "../methods/GetGames";
import gamesStyle from '../styles/gamesStyle.module.css';
import styles from '../styles/Home.module.css';
import { shortenPubkey } from "../methods/utils";
import { useRouter } from "next/navigation";
import { defaultPubkey } from "../config";


export const YourGames: FC = () => {
    const router = useRouter()
    const wallet = useWallet();
    const [games, setGames] = useState(null);
    useEffect(() => {
        if (games == null && wallet.connected) {
            console.log("Calling get your games in useEffect");
            // 5DLjbbhENEsZH9fPkZfRSgLjbmkNwq3h81Yuf8CaZo2j
            getYourGames(wallet.publicKey.toString()).then(res => {
                setGames(res);
            });

        }



    });


    return (

        <div className={gamesStyle.container} >
            <h1>Your games</h1>
            <div className={gamesStyle.separationLine}> </div>
            <div className={gamesStyle.listContainer} >
                {games ? games.map((game) =>
                    <>

                        <div key={game.account.id.toNumber()} className={gamesStyle.singleGame}>
                            <img src="../assets/preview.png" />
                            <div className={gamesStyle.gameInfos}>
                                <div className={gamesStyle.gameActions}>
                                    <p style={{ color: "white" }}>Game #{game.account.id.toNumber()}</p>
                                    <button onClick={() => router.push(`/games/${game.account.id.toNumber()}`)}>Play</button>
                                </div>
                                <div className={gamesStyle.gamePlayers}>
                                    <p style={{ color: "#ba9ffb" }}>{shortenPubkey(game.account.playerWhite.toString())}</p>
                                    <p style={{ fontWeight: "bold" }}>vs</p>
                                    <p style={{ color: "black" }}>{game.account.playerBlack.toString() === defaultPubkey ? "????????" : shortenPubkey(game.account.playerBlack.toString())}</p>
                                </div>

                            </div>

                        </div>


                    </>
                )
                    :
                    <></>}


            </div >

        </div >

    )
}
