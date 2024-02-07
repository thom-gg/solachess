import type { AppProps } from "next/app"
import WalletContextProvider from "../components/WalletContextProvider"
import { ChakraProvider } from "@chakra-ui/react"
import Head from "next/head"


function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <WalletContextProvider>
                <Head>
                    <title>Solachess</title>
                </Head>
                <Component {...pageProps} />
            </WalletContextProvider>
        </ChakraProvider>
    )
}

export default MyApp
