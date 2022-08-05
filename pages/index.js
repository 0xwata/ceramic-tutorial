import styles from '../styles/Home.module.css'
import { Web3Provider } from "@ethersproject/providers"
import { useEffect, useRef, useState } from "react"
import Web3Modal from "web3modal"
import { useViewerConnection } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import { useViewerRecord } from "@self.id/react";


function Home() {
  const [connection, connect, disconnect] = useViewerConnection();
  const web3ModalRef = useRef();

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  };

  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  const getProvider = async () => {
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new Web3Provider(provider);
    return wrappedProvider;
  }

  useEffect(() => {
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  return (
      <div className={styles.main}>
        <div className={styles.navbar}>
          <span className={styles.title}>Ceramic Demo</span>
          {connection.status === "connected" ? (
              <span className={styles.subtitle}>Connected</span>
          ) : (
              <button
                  onClick={connectToSelfID}
                  className={styles.button}
                  disabled={connection.status === "connecting"}
              >
                Connect
              </button>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.connection}>
            {connection.status === "connected" ? (
                <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
                  <RecordSetter />
                </div>
            ) : (
                <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
            )}
          </div>
        </div>
      </div>
  )
}


function RecordSetter() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tweet, setTweet] = useState([]);
  const record = useViewerRecord("basicProfile");
  // const record = useViewerRecord("secondProfile");


  console.log(record);
  const updateRecordName = async (name) => {
    await record.merge({
      name: name,
    });
  };
  const updateRecordDescription = async (description) => {
    await record.merge({
      description: description
    })
  }
  const updateRecordTweet = async (tweet) => {
    const currentTweets = record.content.tweets ? record.content.tweets : []
    currentTweets.push(tweet)
    await record.merge({
      tweets: currentTweets
    })
  }

  return (
      <div className={styles.content}>
        <div className={styles.mt2}>
          {record.content ? (
              <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
              Description: {record.content.description}
            </span>

                <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
              </div>
          ) : (
              <span>
            You do not have a profile record attached to your 3ID. Create a
            basic profile by setting a name below.
          </span>
          )}
        </div>

        <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.mt2}
        />
        <button onClick={() => updateRecordName(name)}>Update Name</button>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e)=> setDescription(e.target.value)}
          className={styles.mt2}
        />
        <button onClick={() => updateRecordDescription(description)}>Update Description</button>

        <input
          type="text"
          placeholder="Tweet"
          value={tweet}
          onChange={(e)=> setTweet(e.target.value)}
          className={styles.mt2}
        />
        <button onClick={() => updateRecordTweet(tweet)}>Update Tweet</button>
        <ul>
          {record.content.tweets ? (
            record.content.tweets.map((tweet, index) => (
                <li key={index}>{tweet}</li>
              )
            )
          ) : (
            <li>no post</li>
          )}
        </ul>
      </div>
  );
}

export default Home;