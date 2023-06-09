import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Flwts } from '@/utils/flwt';
import path from 'node:path';
import { Document } from 'langchain/document';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

const processDocuments = async (docs: Document<Record<string, any>>[],fileName: string) => {
  try {
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME + ""); //change to your own index name
    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: fileName,
      textKey: 'text',
    });
    console.log('ingestion complete:' + fileName);
    Flwts.writeToFile(fileName);
    console.log('writeToFile complete:' + fileName);
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

export const run = async () => {
  try {
    /*load raw docs from all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (filePath) => new CustomPDFLoader(filePath),
    });
    const rawDocs = await directoryLoader.load();
    //打印要读取的文档名称
    rawDocs.forEach(async (doc) => {
      const fileName = path.basename(doc.metadata.source);
      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.splitDocuments([doc]);
      console.log('creating vector store...' + fileName);
      await processDocuments(docs,fileName);
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('all operation complete');
})();