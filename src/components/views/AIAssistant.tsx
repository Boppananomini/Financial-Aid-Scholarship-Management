import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setConversationId(data.id);
      const msgs = (data.messages as any[]) || [];
      setMessages(
        msgs.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    } else {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your AI scholarship assistant. I can help you understand financial aid, find scholarships that match your profile, and guide you through the application process. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const saveConversation = async (msgs: Message[]) => {
    if (!user) return;

    const conversationData = {
      user_id: user.id,
      messages: msgs.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      context: {},
    };

    if (conversationId) {
      await supabase
        .from('ai_conversations')
        .update(conversationData)
        .eq('id', conversationId);
    } else {
      const { data } = await supabase
        .from('ai_conversations')
        .insert(conversationData)
        .select()
        .single();

      if (data) {
        setConversationId(data.id);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: input,
            conversationHistory: updatedMessages.slice(-10),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || "I'm having trouble processing that right now. Please try again.",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm currently unable to respond. This feature requires OpenAI API integration. In the meantime, I can help you navigate the platform and answer general questions about scholarships.",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionPrompts = [
    "What scholarships am I eligible for?",
    "How do I write a strong scholarship essay?",
    "What documents do I need for financial aid?",
    "When should I start applying for scholarships?",
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600">Get personalized scholarship guidance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-3">Try asking:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestionPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about scholarships..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
