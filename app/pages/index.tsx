import { NextPage } from "next"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import dynamic from 'next/dynamic';

import { YourGames } from "../components/YourGames"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import styles from '../styles/Home.module.css';
import { WalletMultiButtonDynamic } from "../components/WalletMultiButtonDynamic";
import { WaitingGames } from "../components/WaitingGames";
import { useCallback, useEffect, useState } from "react";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/idl.json"
import { setupEventListener, setupGlobalEventListener } from "../methods/ReadGrid";
import CreateNewGame from "../components/CreateNewGame";

const Home: NextPage = (props) => {
    const [key, setKey] = useState(0);


    const wallet = useWallet();

    // add this
    // const WalletMultiButtonDynamic = dynamic(
    //     async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    //     { ssr: false }
    // );
    // getWaitingGames();



    useEffect(() => {
        let eventEmitter = setupGlobalEventListener();
        console.log(eventEmitter);
        eventEmitter.on('change', function (e) {
            console.log("GOT EVENT");
            console.log(e);

            setKey(key + 1);

        });
    });

    return (
        // <div className={styles.container}></div>
        <div id="app" style={{ display: "grid", placeContent: "center", height: "100vh", backgroundColor: "#1a1625" }}>
            {wallet.connected ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CreateNewGame />
                    <YourGames key={"your" + key} />
                    <WaitingGames key={"waiting" + key} />
                </div>
                :
                <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <h1 style={{ fontSize: "150%", color: "white" }}>Please connect to gain access to the app</h1>
                    <WalletMultiButtonDynamic />
                </div>
            }
            {/* <WaitingGames /> */}
            <div style={{ position: "absolute", top: "5px", right: "5px" }}>
                <WalletMultiButtonDynamic />

            </div>
        </div>



        // <>




        //   <div className={styles.App}>
        //     <Head>
        //       <title>Anchor Frontend Example</title>
        //     </Head>
        //     <div>

        //       <AppBar />
        //       <div className={styles.AppBody}>
        //         {/*  {wallet.connected ? ( 
        //            <>
        //               <ReadData
        //               counter={counter}
        //                setTransactionUrl={setTransactionUrl}
        //             />
        //             <ReadData2 /> 
        //               <ChessBoard /> 

        //            </> 
        //         // ) : (
        //           // <Text color="white">Connect Wallet</Text>
        //         // )} */}
        //         <ChessBoard />
        //         <Spacer />
        //         {transactionUrl && (
        //           <Link href={transactionUrl} color="white" isExternal margin={8}>
        //             View most recent transaction
        //           </Link>
        //         )}
        //       </div>
        //     </div>


        //   </div></>
    )
}

export default Home
