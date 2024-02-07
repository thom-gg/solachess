import { useRouter } from 'next/navigation';
import { defaultPubkey } from '../config';
import { shortenPubkey } from '../methods/utils';
import styles from '../styles/Home.module.css';
import { useState } from 'react';


interface Props {
    userPubkey: string,
    blackPubkey: string,
    whitePubkey: string,
    winnerPubkey: string,
    boardWidth: number,

}


export default function GameOver({ userPubkey, blackPubkey, whitePubkey, winnerPubkey, boardWidth }: Props) {
    let isOver = winnerPubkey !== defaultPubkey;

    const router = useRouter();
    const [modalOpened, setModalOpened] = useState<boolean>(isOver);

    let modalWidth = (boardWidth / 8) * 6;
    let modalHeight = (boardWidth / 8) * 4;

    let looserPubkey = winnerPubkey === blackPubkey ? whitePubkey : blackPubkey;
    return (
        <div style={{
            display: (isOver && modalOpened) ? "flex" : "none",
            backgroundColor: "rgb(40, 40, 40, 0.90)",
            backdropFilter: "blur(5px)",
            position: "absolute",
            width: modalWidth + "px",
            height: modalHeight + "px",
            left: (window.innerWidth / 2) - (modalWidth / 2) + "px",
            top: (window.innerHeight / 2) - (modalHeight / 2) + "px",
            borderRadius: "10px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            <div style={{ width: "95%", display: "flex", justifyContent: "end" }}>
                <button onClick={() => setModalOpened(false)}>x</button>
            </div>
            <h1 style={{ fontSize: "2vw", fontWeight: "bold" }}>{shortenPubkey(winnerPubkey)} won</h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p>{shortenPubkey(winnerPubkey)}</p>
                <p> vs</p>
                <p>{shortenPubkey(looserPubkey)}</p>
            </div>

            <div style={{ marginBottom: "3vh" }}>
                <button onClick={() => router.push("/")}
                    style={{ borderRadius: "5px", padding: "4px 1rem", backgroundColor: "rgb(10,10,10,0.8)" }}>
                    Home page</button>
            </div>

        </div >
    )
}