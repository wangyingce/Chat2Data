// import { CustomPDFLoader } from '@/utils/customPDFLoader';
// import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import path from 'node:path';

// const directoryLoader = new DirectoryLoader('docs', {
//   '.pdf': (filePath) => new CustomPDFLoader(filePath),
// });
// const rawDocs = await directoryLoader.load();
// rawDocs.forEach((doc) => {
//   const fileName = path.basename(doc.metadata.source);
//   process.env.PINECONE_NAME_SPACE = path.basename(doc.metadata.source);
//   // console.log(`Loaded process.env.PINECONE_NAME_SPACE: ${process.env.PINECONE_NAME_SPACE}`);
// });

/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? ''; //namespace is optional for your vectors
console.log('PINECONE_NAME_SPACE:'+PINECONE_NAME_SPACE)

export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
