import React, {useState , useEffect} from 'react'
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { GetServerSideProps }  from 'next';
import { sanityClient, urlFor } from '../sanity';
import Link from 'next/link'
import {BigNumber} from 'ethers'
import toast, { Toaster } from "react-hot-toast";
import Image  from 'next/image';
import { Creator, Collection } from '../typings'

interface Props {
  collection: Collection
}

function Dropsite({collection}: Props) {

  const [claimedSupply, setClaimedSupply] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [priceInEth, setPriceInEth] =useState<string>()
  const [loading , setLoading] = useState<boolean>(true)
  const nftDrop = useNFTDrop(collection.address)
  
  //Auth
  const connectWithMetamask = useMetamask ()
  const address = useAddress ()
  const disconnect = useDisconnect()
  //----


useEffect(() => {

  if (!nftDrop) return 

  const fetchPrice = async() => {
    const claimConditions = await nftDrop.claimConditions.getAll();
    setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)

  }

  fetchPrice();

}, [nftDrop])



useEffect(() => {
  if (!nftDrop) return;

  const fetchNFTDropData =async () => {
    setLoading(true);

    const claimed = await nftDrop.getAllClaimed();
    const total = await nftDrop.totalSupply();

    setClaimedSupply(claimed.length);
    setTotalSupply(total);

    setLoading(false);
    
  }
  fetchNFTDropData();
}, [nftDrop])


const mintNft = () => {
  if ( !nftDrop || !address) return

  const quantity = 1 //how many unique nft to mint

  setLoading(true)

  const notification = toast.loading('minting...',{
    style: {
      background:'white',
      color: 'green',
      fontWeight: 'bolder',
      fontSize : '17px',
      padding : '20px',

    },
  })

  nftDrop
  .claimTo(address, quantity)
  .then(async (tx) => {

    const receipt = tx[0].receipt //transaction receipt
    const claimedTokenId = tx[0].id //the id of the nft claimed
    const claimedNFT = await tx[0].data() //get the claimed nft metadata

    toast('HOOOORAYY... You succesfully minted Cat',{
      duration: 8000,
      style: {
        background:'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize : '17px',
        padding : '20px',

      },
    })

    console.log(receipt)
    console.log(claimedTokenId)
    console.log(claimedNFT)

  })
  .catch(err => {
    console.log(err)
    toast('whooops... Something went wrong!',{
      style: {
        background:'red',
        color: 'white',
        fontWeight: 'bolder',
        fontSize : '17px',
        padding : '20px',
      },
    })
  })
  .finally(()=> {
    setLoading(false)
    toast.dismiss(notification)

  }) 
}



  return (
   
    <div className='font-press flex h-screen flex-col lg:grid lg:grid-cols-10 '>

<Toaster position='bottom-center'/>
    {/* Left */}
      <div className='bg-[#facf38] lg:col-span-4'>
        <div className='flex flex-col items-center justify-center py-2 lg:min-h-screen'>
          <div className='bg-gradient-to-br from-orange-300 to-orange-200 p-2 rounded-xl'>
            <img className='w-44 rounded-xl  object-cover lg:h-96 lg:w-72' src={urlFor(collection.previewImage).url()} alt="" /> 
          </div>
          <div className='space-y-2 text-center p-5 '>
            <h1 className='text-4xl font-bold text-black'>
            {collection.nftCollectionName}
            </h1>
            <h2 className='text-xl text-black-300'>
              {collection.description}
            </h2>
          </div>
        </div>
      </div>





    {/* Right */}

    <div className='bg-[#fa8400] flex flex-1 flex-col p-12 lg:col-span-6'>
      {/* Header */}
      <header className='flex items-center justify-between'>
        <Link href={'/'}>
        <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>
          <span className='font-extrabold underline decoration-orange-600/50'>Ordinal Cats</span>
        </h1>
        </Link>


        <button onClick={() => (address ? disconnect() : connectWithMetamask())} className='rounded-full bg-[#facf38] px-4 py-2 text-xs font-bold text-black lg:px-5 lg:py-3 lg:text-base'> { address ? 'Connected' : 'Connect Wallet'}</button>
      </header>

      <hr className='my-2 border'/>
      {address && (
        <p className='text-xs text-yellow-300 text-center'>You are logged in with wallet
         <span className='text-black'> {address.substring(0,5)}...{address.substring(address.length-5)}</span>
        </p>
      )}




      {/* Content */}

      <div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center'>
        <img className='w-80 object-contain pb-10 lg:h-40' src={urlFor(collection.mainImage).url()} alt="" />

        <h1 className='text-xl font-bold lg:text-2xl lg:font-bold'>{collection.title}</h1>

           {loading  ? (
            <p className='font-press pt-2 text-xl text-red-600 animate-bounce'>Loading...</p>

           ):(
            <p className='font-press pt-2 text-xl text-green-600'>{claimedSupply}/{totalSupply?.toString()} NFTs Claimed</p>

           )} 
       </div>

      {/* Mint Button */}

      <button onClick={mintNft}
       disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} className='h-16 bg-[#facf38] w-full text-Black rounded-full mt-10 font-bold disabled:bg-gray-400' >
        {loading ? (
          <>Loading</>

        ) : claimedSupply === totalSupply?.toNumber() ? (
          <>SOLD OUT</>
        ) : !address ? (
          <>Connect Wallet To Mint</>
        ) : (
          <span className='font-bold'>Mint({priceInEth} ETH)</span>
        )}
        </button>
    </div>
  </div>
  )
}

export default Dropsite

export const getServerSideProps: GetServerSideProps = async ({params}) => {

  const query = `*[_type == "collection" && slug.current == $id][0]{
      _id,
      title,
      address,
      description,
      nftCollectionName,
      mainImage{
      asset
      },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator -> {
      _id,
      name,
      address,
      slug{
        current
      },
    },
  }`

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  })
  
  if (!collection) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      collection,
    },
  }
}