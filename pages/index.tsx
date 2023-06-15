import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import { Flwts } from '@/utils/flwt';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';



// export async function getServerSideProps(context:String) {
//
//   console.log(context);
//   const fileContent = await Flwts.readFileContent();
//   // fileContent 会作为属性传递给 Home 组件
//   return {props: {fileContent,},};
// }
export default function Home({fileContent= []}) {
  const [items, setItems] = useState<string[]>(fileContent);
  const [selectValue, setSelectValue] = useState<string>('');
  const [modelSelectValue, setModelSelectValue] = useState<string>('');

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    // pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: '选一个主题让我们开始讨论吧?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ic = urlParams.get('ic');
      try {
        // const response = await fetch('/api/getNameSpace?ic='+ic); // 替换为实际的后台查询接口地址
        const response = await fetch('/api/getNameSpace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ic }),
        });
        const data = await response.json();
        const optionValues = data.optionValues; // 假设后台返回的数据格式为 { optionValues: [...] }
        setItems(optionValues);
      } catch (error) {
        alert('缺少ic或者ic错误，无法加载主题列表');
        console.log('An error occurred while fetching options.', error);
      }
    };
    fetchOptions();
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    if (!selectValue) { // 添加条件判断，检查选项值是否为空
      alert('请选择一个主题');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');
    const urlParams = new URLSearchParams(window.location.search);
    const ic = urlParams.get('ic');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
          ic,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              // sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleSelectChange = async (event:React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    // 调用你的函数，并将所选的值作为参数传递
    console.log('selectedValue:'+selectedValue);
    setSelectValue(selectedValue);
    const response = await fetch('/api/updatens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedValue }),
    });

    const data = await response.json();
    console.log(data.message);  // 打印服务器端返回的消息
    // alert('修改成功');
  }

  const modelSelectChange = async (event:React.ChangeEvent<HTMLSelectElement>) => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const ic = urlParams.get('ic');
    // alert("ic:"+ic);
    const modelSelectedValue = event.target.value;
    // 调用你的函数，并将所选的值作为参数传递
    console.log('modelSelectedValue:'+modelSelectedValue);
    setModelSelectValue(modelSelectedValue);
    const response = await fetch('/api/updatemds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelSelectedValue }),
    });

    const data = await response.json();
    console.log(data.message);  // 打印服务器端返回的消息
    // alert('修改成功');
  }

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          {/* <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
          God's in his heaven. All's right with the world.
          </h1> */}
          <div className={styles.selecttext}>
          选择主题:
          <select  className={styles.selectoption} onChange={handleSelectChange} required  disabled={selectValue !== ''}>
          <option value="">请选择一个主题</option>
            {items.map((item, index) => (
              <option key={index} value={item}>
              {item}
              </option>
            ))}
          </select>
          </div>
          {false && (
             <div className={styles.selecttext}>
             选择模式:
             <select  className={styles.selectoption} onChange={modelSelectChange} required  disabled={modelSelectValue !== ''}>
                 <option value="标准">标准</option>
                 <option value="扩展">扩展</option>
                 <option value="创意">创意</option>
             </select>
             </div>
          )}
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="40"
                        height="40"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'What is this case about?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
        <footer className="m-auto p-4">
            God's in his heaven. All's right with the world.
            Powered by LangChainAI. Demo built by Mayo. Project built by wangyc.
        </footer>
      </Layout>
    </>
  );
}
