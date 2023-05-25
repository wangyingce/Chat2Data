import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Flwts } from '@/utils/flwt';
import path from 'node:path';

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
    rawDocs.forEach(async (doc) => {
      const fileName = path.basename(doc.metadata.source);
      // process.env.PINECONE_NAME_SPACE = fileName;
      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.splitDocuments(rawDocs);
      console.log('creating vector store...'+fileName);
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME+""); //change to your own index name
      //embed the PDF documents
      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: fileName,
        textKey: 'text',
      });
      (async () => {
        try {
          await run();
          // await insertNamespace();
          Flwts.writeToFile(fileName);
          console.log('ingestion complete:'+fileName);
        }catch (error) {
          console.log('error', error);
          throw new Error('Failed to ingest your data');
        }
      })();
    });
    console.log('all ingestion complete');
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};
