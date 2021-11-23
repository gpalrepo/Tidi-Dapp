import './App.css';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
// import { Program, Provider, web3, anchor } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
// import idl from './idl.json';
import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Select from "react-select";

const wallets = [ getPhantomWallet() ]

const { SystemProgram, Keypair } = anchor.web3;
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}

function App() {
  const [value, setValue] = useState('');
  const [dataList, setDataList] = useState([]);
  const [token, setToken] = useState('So11111111111111111111111111111111111111112');
  const [amount, setAmount] = useState(0);

  console.log(token);
  console.log(value);

  useEffect(() => {
    console.log("token:", amount);
  }, [amount])
  
  const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
    "Deo9WyTj2xKcreHeX97ZH2zGbN3PEJpoonjoXowGBuBw"
  );
  
  const rpcHost = "https://explorer-api.devnet.solana.com";
  const connection = new anchor.web3.Connection(rpcHost);
  const wallet = useWallet()

  const anchorWallet = {
    publicKey: wallet.publicKey,
    signAllTransactions: wallet.signAllTransactions,
    signTransaction: wallet.signTransaction,
  };

  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: "recent",
  });


  console.log(provider);
  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "https://explorer-api.devnet.solana.com";
    const connection = new Connection(network, opts.preflightCommitment);
    
    const provider = new anchor.Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function transfer() {

    const provider = await getProvider();
    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
    const programID = new PublicKey(idl.metadata.address);
    /* create the program interface combining the idl, program ID, and provider */
    const program = new anchor.Program(idl, programID, provider);
    try {
      /* interact with the program via rpc */
      await program.rpc.initialize("Hello World", {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('account: ', account);
      setValue(account.data.toString());
      setDataList(account.dataList);
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  if (!wallet.connected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    const items = [
      {name:'SAMO', value:'So11111111111111111111111111111111111111112'}, 
      {name:'SOL', value:'7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'}, 
      {name:'SRM', value:'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'}, 
      {name:'SBR', value:'Cum6sRPGpWYQHZapekDtMhbZ1BQ2QkYv9PAwQjypxMVo'}
    ];
    const options = items.map(item => ({ label: item.name, value: item.value }));
    return (
      <div className="App">
        <div>
          {
            // !value && (
              <div style={{width:"40%", margin:"auto", marginTop:"200px"}}>
                <Select
                  options={options}
                  theme={theme => ({
                    ...theme,
                    borderRadius: "10px",
                    padding:"0 20px",
                    marginTop:"100px",
                    colors: {
                      ...theme.colors,
                      text: "orangered",
                      primary25: "hotpink",
                      primary: "black"
                    }
                  })}
                  onChange={(e)=>{setToken(e.value)}}
                />
                <input type="number" style={{width:"100%", height:"30px", borderRadius:"10px", textAlign:"center", marginTop:"50px"}} onChange={(e)=>{console.log(e.target.value)}} />
                <button onClick={transfer} style={{padding:"0 20px", margin:"50px", fontSize:"15pt"}}>transfer</button>
              </div>
            // )
          }
          {
            dataList.map((d, i) => <h4 key={i}>{d}</h4>)
          }
        </div>
      </div>
    );
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="https://explorer-api.devnet.solana.com">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;