import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Flwts } from '@/utils/flwt';
import { insertNamespace } from '@/utils/mysql-client';

// import path from 'node:path';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (filePath) => new CustomPDFLoader(filePath),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();
    //打印要读取的文档名称
    // rawDocs.forEach((doc) => {
    //   const fileName = path.basename(doc.metadata.source);
    //   process.env.PINECONE_NAME_SPACE = fileName;
      // console.log(`PINECONE_NAME_SPACE:`,PINECONE_NAME_SPACE);
    // });

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    // console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  try {
    await run();
    // await insertNamespace();
    Flwts.writeToFile(PINECONE_NAME_SPACE);
    console.log('ingestion complete');
  }catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
})();
