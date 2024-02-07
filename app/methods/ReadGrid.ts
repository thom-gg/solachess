import { PublicKey, clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

import * as anchor from "@coral-xyz/anchor"
import idl from "../idl/idl.json"
import { Piece, PieceColor, PieceType } from "../components/Chessboard";
import { GameInfos } from "../pages/games/[id]";
import { programPubkey } from "../config";

export function formatDataToGameInfo(data) {
    let piecesArr: Piece[] = [];
    for (let i = 0; i < data.grid.length; i++) {
        if (data.grid[i].piece.empty != undefined) { continue; }  // if this piece is empty then we're not adding anything
        let [pieceColor, colorString] = getColorObject(data.grid[i].color);
        let [pieceType, typeString] = getPieceObject(data.grid[i].piece);


        let tile: Piece = {
            image: `../assets/${colorString}${typeString}.png`,
            x: i % 8,
            y: Math.floor(i / 8),
            pieceColor: pieceColor as PieceColor,
            pieceType: pieceType as PieceType
        }
        piecesArr.push(tile);
    }
    let nextToPlay = (data.nextToPlay.white != undefined) ? PieceColor.White : PieceColor.Black;


    let gameInfos: GameInfos = {
        pieces: piecesArr,
        blackPlayerPubkey: data.playerBlack.toString(),
        whitePlayerPubkey: data.playerWhite.toString(),
        nextToPlay: nextToPlay,
        lastMove: [data.lastMove[0], data.lastMove[1]],
        winner: data.winner.toString()
    }
    return gameInfos;
}

export async function readGrid(id: number) {
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
        anchor.setProvider(provider);

    }

    try {
        const program = new anchor.Program(idl as anchor.Idl, programId)
        let [gameAccountPubKey, gameAccountBump] = PublicKey.findProgramAddressSync([Buffer.from("GAME"), new anchor.BN(id).toArrayLike(Buffer, "be", 8)], programId);
        console.log("GAME ACCOUNT ID ");
        console.log(id);
        console.log("GAME ACCOUNT PUBKEY");
        console.log(gameAccountPubKey.toString());
        let gameData = await program.account.gameAccount.fetch(gameAccountPubKey);
        let gameInfos = formatDataToGameInfo(gameData);
        return gameInfos;
    } catch (e) {
        console.log("ERROR FETCHING");
        console.log(e);
    }

}
function getPieceObject(piece) {


    if (piece.pawn != undefined) {
        return [PieceType.Pawn, "p"];
    }
    else if (piece.rook != undefined) {
        return [PieceType.Rook, "r"];
    }
    else if (piece.knight != undefined) {
        return [PieceType.Knight, "n"];
    }
    else if (piece.bishop != undefined) {
        return [PieceType.Bishop, "b"];
    }
    else if (piece.queen != undefined) {
        return [PieceType.Queen, "q"];
    }
    else {
        return [PieceType.King, "k"];
    }
}
function getColorObject(color) {
    if (color.white != undefined) {
        return [PieceColor.White, "w"];
    }
    else {
        return [PieceColor.Black, "b"];
    }
}

export function setupGlobalEventListener() {
    console.log("TTTTT");
    console.log(programPubkey);
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
        anchor.setProvider(provider);

    }

    try {
        const program = new anchor.Program(idl as anchor.Idl, programId)
        let [configPublicKey, configBump] = PublicKey.findProgramAddressSync([Buffer.from("GLOBAL_INFO")], programId);
        let eventEmitter = program.account.globalInfo.subscribe(configPublicKey, "finalized");
        return eventEmitter;
    }
    catch (e) {

    }
}

export function setupEventListener(id: number) {

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
        anchor.setProvider(provider);

    }

    try {
        const program = new anchor.Program(idl as anchor.Idl, programId)
        let [gameAccountPubKey, gameAccountBump] = PublicKey.findProgramAddressSync([Buffer.from("GAME"), new anchor.BN(id).toArrayLike(Buffer, "be", 8)], programId);
        let eventEmitter = program.account.gameAccount.subscribe(gameAccountPubKey, "confirmed");
        return eventEmitter;
    }
    catch (e) {

    }
}


