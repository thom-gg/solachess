export function shortenPubkey(pubkey) {
    if (pubkey < 32) {
        return pubkey;
    }
    else {
        return pubkey.slice(0, 4) + ".." + pubkey.slice(-4);
    }
}