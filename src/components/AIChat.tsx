import { useState, useRef, useEffect } from 'react';
import type { DayEntry } from '../types';

interface AIChatProps {
  entries: DayEntry[];
  userName?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Simple markdown to HTML converter for chat messages
function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Suggestions for what users can ask
const SUGGESTIONS = [
  "Summarize my mood patterns this week",
  "What emotions have I felt most often?",
  "Give me a personalized reflection prompt",
  "How has my mood been trending?",
  "Suggest ways to improve my wellbeing",
];

export function AIChat({ entries, userName, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi${userName ? ` ${userName}` : ''}! 👋 I'm your wellness companion. I can help you understand your mood patterns, reflect on your emotions, or just chat about how you're feeling. What's on your mind?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate local AI response (no API needed - uses pattern matching and data analysis)
  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Analyze recent entries for context
    const recentEntries = entries.slice(-14);
    const avgMood = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length
      : 0;

    const allEmotions = recentEntries.flatMap(e => e.emotions);
    const emotionCounts: Record<string, number> = {};
    allEmotions.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([e]) => e);

    // Pattern matching for different types of requests
    if (lowerMessage.includes('summar') || lowerMessage.includes('pattern') || lowerMessage.includes('week')) {
      if (recentEntries.length === 0) {
        return "I don't have enough data yet to provide a summary. Keep logging your moods daily, and I'll be able to give you meaningful insights soon! 📊";
      }

      const moodTrend = avgMood >= 4 ? 'positive' : avgMood >= 3 ? 'balanced' : 'challenging';
      const topEmotion = topEmotions[0] || 'varied emotions';

      return `Based on your recent ${recentEntries.length} entries:\n\n` +
        `📊 **Average mood:** ${avgMood.toFixed(1)}/5 (${moodTrend})\n` +
        `💭 **Most common feeling:** ${topEmotion}\n` +
        `📈 **Entries logged:** ${recentEntries.length}\n\n` +
        (avgMood >= 4
          ? "You've been maintaining a positive outlook! Keep up whatever you're doing. 🌟"
          : avgMood >= 3
            ? "You're navigating life's ups and downs well. Remember, balance is healthy."
            : "I notice some challenging days. Remember to be gentle with yourself. Every small step forward counts. 💪");
    }

    if (lowerMessage.includes('emotion') || lowerMessage.includes('feel') || lowerMessage.includes('felt')) {
      if (topEmotions.length === 0) {
        return "I haven't seen many emotions logged yet. When you do your daily reflections, try selecting the emotions that resonate with how you're feeling. Over time, I'll help you see patterns! 🔍";
      }

      return `Here's what I've noticed about your emotional landscape:\n\n` +
        `**Top emotions lately:**\n${topEmotions.map((e, i) => `${i + 1}. ${e} (${emotionCounts[e]} times)`).join('\n')}\n\n` +
        (topEmotions.includes('anxious') || topEmotions.includes('stressed')
          ? "I see some stress showing up. Have you tried the 4-7-8 breathing technique? It can help in the moment."
          : topEmotions.includes('happy') || topEmotions.includes('grateful')
            ? "Lots of positive emotions! What's been bringing you joy lately?"
            : "Your emotional range shows you're tuned into your feelings. That's a strength! 🌈");
    }

    if (lowerMessage.includes('prompt') || lowerMessage.includes('reflect') || lowerMessage.includes('question')) {
      const prompts = [
        "What's one small thing that brought you unexpected joy recently?",
        "If your current mood were weather, what would it be and why?",
        "What would you tell your past self from one week ago?",
        "What's something you're looking forward to, even if it's small?",
        "Who or what made you feel supported lately?",
        "What's one thing you did well today that you might not have noticed?",
        "If you could let go of one worry right now, what would it be?",
        "What does 'rest' mean to you right now?",
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      return `Here's a reflection prompt for you:\n\n✨ *${randomPrompt}*\n\nTake your time with it. There's no right or wrong answer.`;
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      if (recentEntries.length < 3) {
        return "I need a few more days of data to spot trends. Keep logging, and I'll have insights for you soon! 📈";
      }

      const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
      const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.3) {
        return `📈 **Good news!** Your mood has been trending upward recently.\n\nFrom ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)} average.\n\nWhatever changes you've made seem to be helping. Can you identify what's been different?`;
      } else if (secondAvg < firstAvg - 0.3) {
        return `I notice your mood has dipped slightly recently. That's completely normal—life has ups and downs.\n\n**Some ideas that might help:**\n• Get some sunlight or fresh air\n• Connect with someone you trust\n• Do one small thing that usually brings you joy\n• Be extra kind to yourself today\n\nRemember: tracking through tough times is valuable. You're doing great by showing up. 💙`;
      } else {
        return `Your mood has been fairly steady lately, averaging around ${avgMood.toFixed(1)}/5.\n\nStability can be a sign of emotional resilience. Is there anything specific you'd like to work on or explore?`;
      }
    }

    if (lowerMessage.includes('suggest') || lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('wellbeing')) {
      const tips = [
        "**Try the 2-minute rule:** If something takes less than 2 minutes, do it now. Small wins build momentum.",
        "**Practice 'habit stacking':** Attach a new positive habit to something you already do daily.",
        "**Do a 'brain dump':** Write everything on your mind for 5 minutes. Getting it out of your head can bring relief.",
        "**Try the 5-4-3-2-1 grounding:** Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.",
        "**Schedule worry time:** Give yourself 10 minutes to worry, then consciously move on. It sounds odd, but it works!",
        "**Practice self-compassion:** Talk to yourself like you would to a good friend going through the same thing.",
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      return `Here's a wellbeing tip for you:\n\n${randomTip}\n\nWant me to suggest something else?`;
    }

    // Default conversational response
    const conversationalResponses = [
      "That's interesting! Tell me more about how you're feeling.",
      "I appreciate you sharing that. How has that been affecting your mood?",
      "I hear you. Would you like me to suggest a reflection prompt, or would you prefer to just chat?",
      "Thanks for opening up. Is there something specific I can help you explore?",
    ];

    return conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)] +
      "\n\nYou can also ask me to:\n• Summarize your mood patterns\n• Analyze your emotions\n• Give you a reflection prompt\n• Suggest wellbeing tips";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      const response = await generateResponse(userMessage.content);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-silver-200/50 dark:border-silver-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500
                          flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-silver-800 dark:text-silver-100">
                Wellness Companion
              </h3>
              <p className="text-xs text-silver-500 dark:text-silver-400">
                Powered by your mood data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-silver-400 hover:text-silver-600 dark:hover:text-silver-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                          ${message.role === 'user'
                            ? 'bg-lavender-500 text-white rounded-br-md'
                            : 'bg-silver-100 dark:bg-silver-800 text-silver-700 dark:text-silver-200 rounded-bl-md'
                          }`}
              >
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-silver-100 dark:bg-silver-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-silver-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-silver-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-silver-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only show if no user messages yet) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-silver-400 dark:text-silver-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full text-xs bg-silver-100 dark:bg-silver-800
                           text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700
                           transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-silver-200/50 dark:border-silver-700/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-silver-50 dark:bg-silver-800/50
                       border border-silver-200 dark:border-silver-700 text-silver-800 dark:text-silver-100
                       placeholder-silver-400 focus:outline-none focus:ring-2 focus:ring-lavender-400
                       text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-lavender-500 hover:bg-lavender-600 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
