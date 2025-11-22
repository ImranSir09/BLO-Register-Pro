import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useHouseholds, useElections } from '../contexts/AppContexts';
import { SparklesIcon, SendIcon } from '../components/Icons';
import { ThinkingLoader } from '../components/Loader';

type Message = {
  role: 'user' | 'model';
  content: string;
};

const AIAssistant: React.FC = () => {
    const { households } = useHouseholds();
    const { voters } = useElections();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I am your AI assistant. Ask me anything about your census and voter data, like 'How many voters are over 80?' or 'List all members of house number 23'." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage = userInput.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setUserInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const systemInstruction = `You are a helpful AI assistant for a Booth Level Officer (BLO) in India.
            Your task is to answer questions based ONLY on the JSON data provided below. Do not use any external knowledge or make up information.
            If the data is insufficient to answer a question, state that clearly. Be concise and accurate in your responses.
            When listing people or households, format them clearly.

            Here is the census data which includes all household members:
            ${JSON.stringify(households)}

            Here is the electoral roll data which includes all registered voters:
            ${JSON.stringify(voters)}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userMessage,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            const aiResponse = response.text;
            setMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error while processing your request. Please check your connection and try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-800">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                             <div className="w-8 h-8 flex-shrink-0 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-lg text-white ${msg.role === 'user' ? 'bg-primary' : 'bg-slate-700'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 flex-shrink-0 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div className="max-w-md p-3 rounded-lg bg-slate-700">
                           <ThinkingLoader />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 pb-20 bg-slate-900 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        placeholder="Ask about your data..."
                        className="w-full p-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="p-3 bg-primary text-white rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-600 transition-colors"
                    >
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;