import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';

//保险专用品种
const CONDENSE_PROMPT = `As an insurance AI assistant,combine `+PINECONE_NAME_SPACE+` given the following conversation and a follow up question, rephrase the follow up question to be a standalone question with chinese.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `As an insurance AI assistant. combine `+PINECONE_NAME_SPACE+` and use the following context to answer the final question. Priority answer about insurance liability.
If you don't know the answer, say you don't know. Do not try to make up an answer.
If the question is not relevant to the context, answer politely and you are tuned to answer only questions that are relevant to the context and try to choose something that is relevant to insurance.

{context}

Question: {question}

Helpful answer in markdown with Chinese:`;

console.log('CONDENSE_PROMPT:',CONDENSE_PROMPT);
console.log('QA_PROMPT:',QA_PROMPT);

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(2),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: false, //The number of source documents returned is 4 by default
    },
  );
  // console.log('embedDocuments', vectorstore.embeddings.embedDocuments);
  // console.log('combineDocumentsChain', chain.combineDocumentsChain);
  return chain;
};
