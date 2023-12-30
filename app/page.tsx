'use client'
import { useRef, useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const [thread, setThread] = useState(null)
  const textAreaRef = useRef(null);
  // async function createIndexAndEmbeddings() {
    //   try {
      //     const result = await fetch('/api/setup', {
        //       method: "POST"
        //     })
        //     const json = await result.json()
        //     console.log('result: ', json)
        //   } catch (err) {
          //     console.log('err:', err)
          //   }
          // }

          // services/apiService.js
          const url_object = {
            "Local": 'http://127.0.0.1:8000',
            "Fitmate": 'https://fitmategpt-production.up.railway.app',
            "Dutch": 'https://web-production-d5f7.up.railway.app'
          }
// const []
const [API_URL, setAPI_URL] = useState(url_object["Local"]); // Replace with your FastAPI server URL

const startConversation = async () => {
  const response = await fetch(`${API_URL}/start`);
  return response.json();
};

const sendMessage = async (threadId, message) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ thread_id: threadId, message }),
  });
  return response.json();
};

const checkRunStatus = async (threadId, runId) => {
  const response = await fetch(`${API_URL}/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ thread_id: threadId, run_id: runId }),
  });
  return response.json();
};

  // const baseUrl = 'http://127.0.0.1:8000'
  // async function sendQuery() {
  //   if (!query) return
  //   setResult('')
  //   setLoading(true)
  //   if (!hasChatStarted) {
  //     try {
  //       const result = await fetch(`${baseUrl}/start`, 
  //       {
  //         method: "GET",
  //         // body: JSON.stringify({history, query})
  //       }
  //       )
  //       const json = await result.json()
  //       setThread(json.thread)
  //       setHasChatStarted(true)

  //     } catch (err) {
  //       console.log('err:', err)
  //       // setLoading(false)
  //     }
  //   }
  //   try {
  //     const result = await fetch(`${baseUrl}/chat`, {
  //       method: "POST",
  //       body: JSON.stringify({chat_request})
  //     })
  //     const json = await result.json()
  //     setResult(json.data)
  //     setHistory(json.history)
  //     setLoading(false)
  //     setQuery('')
  //     // textAreaRef.current.focus()
  //     // textAreaRef.current = ''

  //     console.log("full history: ", json.history)
  //   } catch (err) {
  //     console.log('err:', err)
  //     setLoading(false)
  //   }
  // }

  // async function sendQuery() {
  //   if (!query) return
  //   setResult('')
  //   setLoading(true)
  //   try {
  //     const result = await fetch('/api/read', {
  //       method: "POST",
  //       body: JSON.stringify({history, query})
  //     })
  //     const json = await result.json()
  //     setResult(json.data)
  //     setHistory(json.history)
  //     setLoading(false)
  //     setQuery('')
  //     // textAreaRef.current.focus()
  //     // textAreaRef.current = ''

  //     console.log("full history: ", json.history)
  //   } catch (err) {
  //     console.log('err:', err)
  //     setLoading(false)
  //   }
  // }
  const [threadId, setThreadId] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleStart = async () => {
    const data = await startConversation();
    setThreadId(data.thread_id);
  };

  const handleSend = async () => {
    if (!threadId) {
      handleStart()
    }
    try {
      if (!threadId) {
        console.log('threadId not set')
        return;
      }
      const { run_id: runId } = await sendMessage(threadId, message);
  
      // Initialize a timeout for the operation
      const timeout = 10000; // 10 seconds, adjust as needed
      const startTime = Date.now();
  
      // Function to periodically check the status
      const checkStatus = async () => {

        const statusData = await checkRunStatus(threadId, runId);
        console.log('statusData:', statusData)
        if (statusData.status === 'completed') {
          // If completed, set the response
          setResponse(statusData.response);
          // add to history
          // @ts-ignore
          setHistory([...history, {source: 'user', message}, {source: 'bot', message: statusData.response}])
        } else if (statusData.status === 'in_progress' || statusData.status === 'requires_action' || statusData.response === 'timeout') {
          // If still in progress, check again after a delay
          const startTime = Date.now() + 1500;
          setTimeout(checkStatus, 1500); // Check every second, adjust as needed
        } else {
          // Handle other statuses or errors
          setResponse(`An error occurred: ${statusData.status}`);
        }
      };
  
      // Start the status check loop
      checkStatus();
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error in handleSend:', error);
      setResponse('An error occurred while sending the message.');
    }
  };
  console.log("Api url: ",API_URL)
  
  return (
    // TODO: move input to bottom
    // have whatsapp style message boxes
    <main className="flex flex-col items-center justify-between">
      <div className="min-h-screen bg-gray-400 overflow-y-auto">
        {/* {response && <p>{response}</p>} */}
        {
          history.map((item, index) => {
            console.log('item:', item)
            return (<div 
              // @ts-ignore
              className={`rounded-xl bg-white px-1 mx-5 mb-3 shadow-lg shadow-gray-600 max-w-[80%] ${item.source === 'user' ? 'ml-auto' : 'mr-auto'}
            `}
            // @ts-ignore
              key={index}>{item.message}</div>)
          })
        }
        {
          loading && <p>Asking AI ...</p>
        }

      </div>
        <div className="flex flex-col items-center justify-center bg-gradient-to-t from-gray-600 via-gray-400 to-gray-600 p-4 fixed bottom-4 w-full">
          <textarea className='text-black py-1 max-w-[80%] center' cols={40} onChange={e => setMessage(e.target.value)}/>
          <button className="px-7 py-1 rounded-2xl bg-white text-black mt-2 mb-2 max-w-[80%]" onClick={handleSend}>Send Message</button>
        </div>
        {/* dropdown to change APIUrl */}
        <select name="api_url" id="api_url" onChange={e => setAPI_URL(url_object[e.target.value])}>
          <option value="Local">Local</option>
          <option value="Fitmate">Fitmate</option>
          <option value="Dutch">Dutch</option>
        </select>

    </main>
  )
}
