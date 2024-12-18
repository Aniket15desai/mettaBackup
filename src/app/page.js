'use client';
import { ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import { HashLoader } from 'react-spinners';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function Home() {
  const [isSent, setIsSent] = useState(true);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const ref = useRef(null);

    // Load messages from local storage when the component mounts
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    // Save messages to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);


    const sendMessage = async () => {
        let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=` + API_KEY;

        let messagesToSend = [
            ...messages,
            {
                "role": "user",
                "parts": [{
                    "text": currentMessage
                }]
            }
        ];

        setIsSent(false);
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "contents": messagesToSend
            })
        });

        let resjson = await res.json();
        setIsSent(true);

        let responseMessage = resjson.candidates[0].content?.parts[0].text;

        let newAllMessages = [
            ...messages,
            {
                "role": "user",
                "parts": [{
                    "text": currentMessage
                }]
            },
            {
                "role": "model",
                "parts": [{
                    "text": responseMessage
                }]
            }
        ];
        setMessages(newAllMessages);
        setCurrentMessage("");

    };


    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='w-full sm:w-6/12 md:w-[30%] h-full relative'>
            <div className={`w-full h-full bg-[#E6E4E6] relative flex flex-col gap-4 overflow-y-auto border-2 border-[#ff7754] rounded-xl`}>
                <div className='w-full flex bg-[#ff7754] rounded-lg justify-between items-center text-white text-xs font-bold py-3 px-5'>
                    <div className='flex items-center gap-2'>
                        <ChatBubbleLeftRightIcon height={24} width={24} />
                        <div>StuB ChatBot</div>
                    </div>
                </div>
                <div className='w-full h-full gap-1 flex flex-col relative overflow-y-scroll pb-10 px-2'>
                    {messages.map((messageContent, i) => (
                        <div
                            key={i}
                            ref={ref}
                            className={`flex w-full my-1 ${messageContent.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`relative min-h-7 min-w-32 max-w-[80%] px-3 mx-1 py-1 break-normal ${messageContent.role === 'user'
                                    ? 'bg-[#ff7754] rounded-[8px_0px_8px_8px] text-white'
                                    : 'bg-white rounded-[0px_8px_8px_8px] text-black'
                                    }`}
                            >
                                <div className="flex flex-col h-full w-full">
                                    <div className="flex w-full justify-start">{messageContent?.parts[0]?.text}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div >
            <div className="w-full px-3 pb-5 flex absolute bottom-0 overflow-hidden items-center justify-center gap-2">
                <input
                    type="text"
                    className='bg-white h-auto w-full flex border-0 px-5 py-1 text-xl rounded-[20px_50px_50px_20px] text-black text-opacity-35 outline-none'
                    placeholder="Message"
                    value={currentMessage}
                    onChange={(event) => {
                        setCurrentMessage(event.target.value);
                    }}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button onClick={sendMessage} className='flex justify-center items-center p-3 bg-[#ff7754] rounded-full cursor-pointer'>
                    {isSent ? <ChevronRightIcon
                        width={20}
                        height={20}
                    />
                        :
                        <HashLoader color='#ffffff' size={20} />
                    }
                </button>
            </div>
        </div>
    )
}
