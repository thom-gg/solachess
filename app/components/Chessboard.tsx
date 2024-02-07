import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import * as anchor from "@coral-xyz/anchor"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/idl.json"
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { GameInfos } from "../pages/games/[id]";
import { shortenPubkey } from "../methods/utils";
import { isMoveLegal } from "../methods/rules";
import { defaultPubkey, programPubkey } from "../config";
import GameOver from "./GameOver";





export enum PieceType {
    Pawn,
    Rook,
    Knight,
    Bishop,
    Queen,
    King
}
export enum PieceColor {
    White,
    Black
}

export interface Piece {
    image: string
    x: number,
    y: number
    pieceType: PieceType,
    pieceColor: PieceColor,
}

const initialBoardState: Piece[] = [];
for (let i = 0; i < 8; i++) {
    initialBoardState.push({ image: "assets/bb.png", x: i, y: 1, pieceType: PieceType.Bishop, pieceColor: PieceColor.Black });
}
initialBoardState.push({ image: "assets/wp.png", x: 0, y: 5, pieceType: PieceType.Pawn, pieceColor: PieceColor.White });



interface Props {
    gameInfos: GameInfos;
    gameId: number,

}
export default function Chessboard({ gameInfos, gameId }: Props) {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [nextToPlay, setNextToPlay] = useState<PieceColor>(null);
    const chessboardRef = useRef<HTMLDivElement>(null);

    const [blackPubkey, setBlackPubkey] = useState<string>("");
    const [whitePubkey, setWhitePubkey] = useState<string>("");
    const [boardWidth, setBoardWidth] = useState<number>(700);
    const [lastMove, setLastMove] = useState<number[]>([]);
    const [winner, setWinner] = useState<string>("")


    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();
    console.log("Rendering chess board");


    useEffect(() => {
        console.log("In use effect #2");
        setPieces(gameInfos.pieces);
        setNextToPlay(gameInfos.nextToPlay);
        setBlackPubkey(gameInfos.blackPlayerPubkey);
        setWhitePubkey(gameInfos.whitePlayerPubkey);
        setLastMove(gameInfos.lastMove);
        setWinner(gameInfos.winner);

    }, [gameInfos])

    window.onresize = updateSize;
    useEffect(() => {

        updateSize();
    })

    function updateSize() {
        let newWidth = 0;
        newWidth = window.innerWidth / 3;
        if (window.innerWidth < 1000) {
            newWidth = window.innerWidth / 2;

        }
        if (window.innerWidth < 800) {
            newWidth = window.innerWidth / 1.3;
        }

        if (window.innerWidth < 500) {
            newWidth = window.innerWidth - 50;

        }

        setBoardWidth(newWidth);

    }


    function getCoordsOnMouseClick(event, chessboard) {
        let x;
        let y;
        if (blackPubkey === publicKey.toString()) {
            x = 7 - Math.floor((event.clientX - chessboard.offsetLeft) / (boardWidth / 8));

            y = 7 - Math.abs(
                Math.ceil((event.clientY - chessboard.offsetTop - (boardWidth)) / (boardWidth / 8))
            );
        }
        else {
            y = Math.abs(
                Math.ceil((event.clientY - chessboard.offsetTop - (boardWidth)) / (boardWidth / 8))
            );
            x = Math.floor((event.clientX - chessboard.offsetLeft) / (boardWidth / 8));
        }
        return { x: x, y: y };

    }


    function grabPiece(e: React.MouseEvent) {
        // check game isnt over
        if (winner !== defaultPubkey) {
            return;
        }

        if ((nextToPlay === PieceColor.White && publicKey.toString() !== whitePubkey)
            || (nextToPlay === PieceColor.Black && publicKey.toString() !== blackPubkey)) {
            return; // spectators can't grab pieces
        }

        const element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;

        if (element.classList.contains("chessPiece") && chessboard) {

            let coords = getCoordsOnMouseClick(e, chessboard);

            setGridX(coords.x);
            setGridY(coords.y);

            const x = e.clientX - (boardWidth / 16);
            const y = e.clientY - (boardWidth / 16);
            element.style.position = "absolute";
            element.style.left = `${x}px`
            element.style.top = `${y}px`

            setActivePiece(element);

        }

    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const minX = chessboard.offsetLeft - (boardWidth / 32);
            const minY = chessboard.offsetTop - (boardWidth / 32);

            const maxX = chessboard.offsetLeft + chessboard.clientWidth - (boardWidth / 16);
            const maxY = chessboard.offsetTop + chessboard.clientHeight - (boardWidth / 16);


            let x = e.clientX - (boardWidth / 16);
            let y = e.clientY - (boardWidth / 16);

            if (x < minX) {
                x = minX;
            }
            else if (x > maxX) {
                x = maxX;
            }

            if (y < minY) {
                y = minY;
            }
            else if (y > maxY) {
                y = maxY;
            }

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;

        if (activePiece && chessboard) {
            let coords = getCoordsOnMouseClick(e, chessboard);
            const x = coords.x;
            const y = coords.y;

            const currentPiece = pieces.find((p) =>
                p.x == gridX && p.y == gridY
            );


            if (currentPiece &&
                isMoveLegal(currentPiece.x, currentPiece.y, x, y, currentPiece.pieceType, currentPiece.pieceColor, pieces, nextToPlay)) {
                let newPieces = [];
                for (let i = 0; i < pieces.length; i++) {
                    if (pieces[i].x === x && pieces[i].y === y) {
                        // ne pas push
                    }
                    else if (pieces[i].x === currentPiece.x && pieces[i].y === currentPiece.y) {
                        pieces[i].x = x;
                        pieces[i].y = y;
                        newPieces.push(pieces[i]);
                    }
                    else {
                        newPieces.push(pieces[i]);
                    }
                }
                setPieces(newPieces);
                // send transaction to actually play move
                try {
                    console.log("playing move, from " + gridX + "," + gridY + " to " + x + "," + y)
                    playMove(((gridY * 8) + gridX), (y * 8) + x);

                }
                catch (e) {
                    // refresh data (so the failed move doesnt stay displayed)


                }
            }
            else {
                activePiece.style.position = "relative";
                activePiece.style.removeProperty("top");
                activePiece.style.removeProperty("left");
            }

            setActivePiece(null);
        }


    }

    let board = [];

    if (publicKey && publicKey.toString() === blackPubkey) {
        for (let j = 0; j < 8; j++) {
            for (let i = 7; i >= 0; i--) {
                const number = j + i + 2;
                let image = undefined;
                pieces.forEach(p => {
                    if (p.x === i && p.y === j) {
                        image = p.image;
                    }
                });
                let singleDigitIndex = (j * 8) + i;
                let isLastMove = singleDigitIndex === lastMove[0] || singleDigitIndex === lastMove[1];
                board.push(<Tile key={`${j}.${i}`} number={number} isLastMove={isLastMove}
                    image={image} boardWidth={boardWidth} />);

            }
        }
    }
    else {
        for (let j = 7; j >= 0; j--) {
            for (let i = 0; i < 8; i++) {
                const number = j + i + 2;
                let image = undefined;
                pieces.forEach(p => {
                    if (p.x === i && p.y === j) {
                        image = p.image;
                    }
                });
                let singleDigitIndex = (j * 8) + i;
                let isLastMove = singleDigitIndex === lastMove[0] || singleDigitIndex === lastMove[1];

                board.push(<Tile key={`${j}.${i}`} isLastMove={isLastMove} number={number} image={image} boardWidth={boardWidth} />);

            }
        }
    }








    const playMove = useCallback(async (from: number, to: number) => {
        let provider: anchor.Provider

        try {
            provider = anchor.getProvider()
        } catch {
            provider = new anchor.AnchorProvider(connection, wallet, {})
            anchor.setProvider(provider)
        }

        let programId = new PublicKey(programPubkey);
        console.log(programId.toString());
        const program = new anchor.Program(idl as anchor.Idl, programId)
        let [gameAccountPubKey, gameAccountBump] = PublicKey.findProgramAddressSync([Buffer.from("GAME"), new anchor.BN(gameId).toArrayLike(Buffer, "be", 8)], programId);
        let [configPublicKey, configBump] = PublicKey.findProgramAddressSync([Buffer.from("GLOBAL_INFO")], programId);
        const latestBlockHash = await provider.connection.getLatestBlockhash();
        try {
            const ix = await program.methods
                .play(new anchor.BN(gameId), new anchor.BN(from), new anchor.BN(to))
                .accounts({
                    gameAccount: gameAccountPubKey,
                    signer: wallet.publicKey,
                })
                .instruction();
            // const ix = await program.methods.joinGame(new anchor.BN(3))
            //     .accounts({
            //         signer: wallet.publicKey,
            //         gameAccount: gameAccountPubKey,
            //     })
            //     .instruction();

            let tx = new anchor.web3.Transaction();
            tx.add(ix);
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
        <>
            {/* popup displayed only if game is over */}
            <GameOver
                userPubkey={publicKey.toString()}
                blackPubkey={blackPubkey}
                whitePubkey={whitePubkey}
                winnerPubkey={winner}
                boardWidth={boardWidth}

            />

            <div onMouseMove={e => movePiece(e)}
                onMouseDown={e => grabPiece(e)} onMouseUp={e => dropPiece(e)} style={{
                    width: "100vw", height: "100vh", display: "flex",
                    flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                {/* <p>Next to play: {nextToPlay === 1 ? "Black" : "White"}</p>
                <p>Your address {publicKey.toString()} / White pubkey: {whitePubkey} / Black pubkey : {blackPubkey}</p> */}


                <div style={{
                    width: `${boardWidth}px`, display: "flex",
                    flexDirection: "row", alignItems: "center", justifyContent: "start", marginBottom: "1vh",


                }}>
                    <img src="../assets/profileIcon.png" width="25px" />
                    {publicKey.toString() === blackPubkey ?
                        <p style={{
                            fontWeight: nextToPlay === PieceColor.White ? 'bold' : 'normal',
                            opacity: nextToPlay === PieceColor.Black ? '80%' : '100%',
                            color: nextToPlay === PieceColor.White ? '#9171f8' : 'white'
                        }}>
                            {shortenPubkey(whitePubkey)} </p>
                        :
                        <p style={{
                            fontWeight: nextToPlay === PieceColor.Black ? 'bold' : 'normal',
                            opacity: nextToPlay === PieceColor.White ? '80%' : '100%',
                            color: nextToPlay === PieceColor.Black ? '#9171f8' : 'white'
                        }}>
                            {shortenPubkey(blackPubkey)}
                        </p>
                    }

                </div>
                <div id="chessboard"
                    style={{
                        display: "grid", gridTemplateColumns: `repeat(8,${boardWidth / 8}px)`, gridTemplateRows: `repeat(8,${boardWidth / 8}px)`,
                        width: `${boardWidth}px`, height: `${boardWidth}px`, backgroundColor: "#779556", borderRadius: `10px`,
                    }} ref={chessboardRef}>
                    {board}
                </div>
                <div style={{
                    width: `${boardWidth}px`, display: "flex",
                    flexDirection: "row", alignItems: "center", justifyContent: "end", marginTop: "1vh"

                }}>
                    {publicKey.toString() === blackPubkey ?
                        <p style={{
                            fontWeight: nextToPlay === PieceColor.Black ? 'bold' : 'normal',
                            opacity: nextToPlay === PieceColor.White ? '80%' : '100%',
                            color: nextToPlay === PieceColor.Black ? '#9171f8' : 'white'
                        }}>
                            {shortenPubkey(blackPubkey)} <span>(You)</span> </p>
                        :
                        <p style={{
                            fontWeight: nextToPlay === PieceColor.White ? 'bold' : 'normal',
                            opacity: nextToPlay === PieceColor.Black ? '80%' : '100%',
                            color: nextToPlay === PieceColor.White ? '#9171f8' : 'white'
                        }}>
                            {shortenPubkey(whitePubkey)} {publicKey.toString() === whitePubkey ? <span>(You)</span> : <></>}
                        </p>
                    }




                    <img src="../assets/profileIcon.png" width="25px" />

                </div>
                <p style={{ fontSize: "80%", position: "absolute", bottom: "10px" }}>Made with ❤️ by <a style={{ textDecoration: "underline", color: "#5e43f3" }} href="https://github.com/thom-gg/solachess/" target="_blank">Thom</a></p>
            </div >
        </>
    );
}