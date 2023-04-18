import Image from 'next/image'
import Head  from "next/head"
import NextPage  from 'next'
import { sanityClient, urlFor  } from "../sanity"
import Link from 'next/link'

interface props {
  collections: Collection[]

}

const Home: NextPage = ({collections}: props) => {
  return (

    
  <div className='bg-yellow-400 max-auto  flex min-h-screen flex-col py-10 px-10 '>
      <Head>
        <title>Ordinal Cats</title>
        <link rel="stylesheet" href="/fevicon.ico" />
      </Head>

      
        <h1 className='w-52 text-xl font-extralight sm:w-80 py-5'>
          <span className='font-extrabold underline decoration-orange-600/50'>Ordinal Cats</span>
        </h1>        
   

      <main className='bg-orange-500 rounded-lg p-10 shadow-xl shadow-black items-center ' >
        <div className='grid space-x-3 md:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-4'>
          {collections?.map(collection => (

            
            <div key={collection.id} className='flex flex-col items-center'>
              <Image className='h-70 w-50 rounded-2xl object-cover' src={urlFor(collection.mainImage).url()} alt="" />
            <div>
            <h2 className='text-3xl items-center text-center'>{collection.title}</h2>
            <p className='mt-2 text-sm text-white text-center'>{collection.description}</p>
            <Link href={`${collection.slug.current}`} >
            <button className='cursor-pointer transition-all duration-200 hover:scale-105 h-16 bg-[#facf38] w-full text-Black rounded-full mt-2 font-bold disabled:bg-gray-400'>Mint</button>
            </Link>
            </div>
            </div>
            
          ))}
        </div>
      </main>
    </div>


  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
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

  const collections = await sanityClient.fetch(query)

  return{
    props: {
      collections
    }
  }
  
}

