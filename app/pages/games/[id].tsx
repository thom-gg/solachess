
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';
import { NextPage } from 'next/types';
import { useEffect, useState } from 'react';
import Chessboard, { Piece, PieceColor } from '../../components/Chessboard';
import { formatDataToGameInfo, readGrid, setupEventListener } from '../../methods/ReadGrid';
import { WalletMultiButtonDynamic } from '../../components/WalletMultiButtonDynamic';
import Link from 'next/link';




export interface GameInfos {
    pieces: Piece[],
    blackPlayerPubkey: string,
    whitePlayerPubkey: string,
    nextToPlay: PieceColor,
    lastMove: number[],
    winner: string


}



const Game: NextPage = () => {
    const {
        query: { id },
    } = useRouter();

    const [gameInfos, setGameInfos] = useState<GameInfos>(null);
    const wallet = useWallet();
    const [key, setKey] = useState(0);

    const [idEvent, setIdEvent] = useState(-1);


    const [fetchedData, setFetchedData] = useState(false);


    function loadData() {
        readGrid(parseInt(id as string)).then((infos: GameInfos) => {
            console.log("refreshed data : infos " + infos);
            setGameInfos(infos);
        })
    }

    useEffect(() => {
        if (!isNaN(parseInt(id as string)) && gameInfos == null) {
            let eventEmitter = setupEventListener(parseInt(id as string));
            console.log(eventEmitter);
            eventEmitter.on('change', function (e) {
                console.log("GOT EVENT");
                console.log(e);
                let infos = formatDataToGameInfo(e);
                console.log("setting infos to");
                console.log(infos);
                setGameInfos(infos);
                setKey(key + 1);

            });


            setFetchedData(true);
            loadData();

        }






    });


    return (
        <>
            <div style={{ backgroundColor: "#1a1625", color: "white" }}>
                <div style={{ position: "absolute", top: "5px", right: "5px" }}>
                    <WalletMultiButtonDynamic />

                </div>
                {(isNaN(parseInt(id as string)) ?
                    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <h1 style={{ fontSize: "150%" }}>The id {id as string} is invalid !</h1>
                        <Link href="/">Back to games list</Link>
                    </div>

                    :
                    (!(wallet.connected) ?
                        <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <h1 style={{ fontSize: "150%" }}>Please connect to gain access to this page</h1>
                            <WalletMultiButtonDynamic />
                        </div>
                        :
                        (gameInfos != null ? <Chessboard key={key} gameInfos={gameInfos} gameId={parseInt(id as string)} />
                            :
                            <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <h1 style={{ fontSize: "150%" }}>Loading data..</h1>

                            </div>
                        )
                    )
                )}
            </div>
        </>
    )
};

export default Game;