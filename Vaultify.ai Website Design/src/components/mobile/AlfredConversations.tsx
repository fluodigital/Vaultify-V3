import { motion } from 'motion/react';
import { Plus, MessageSquare, Clock, ChevronRight, Sparkles } from 'lucide-react';

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  status?: 'active' | 'completed' | 'pending';
}

interface AlfredConversationsProps {
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

const mockConversations: Conversation[] = [
  {
    id: 'monaco-trip',
    title: 'Monaco Grand Prix Weekend',
    preview: 'You\'re all set. Jet, watch, penthouse & yacht confirmed. Enjoy Monaco! 🇲🇨',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: 'dubai-nye',
    title: 'Dubai New Year\'s Eve',
    preview: 'The Armani suite is honestly one of the best spots for NYE...',
    timestamp: '1 day ago',
    status: 'active',
  },
  {
    id: 'ski-aspen',
    title: 'Aspen Ski Trip Planning',
    preview: 'That 8-bedroom chalet is still available for March. Ski-in/ski-out, private chef...',
    timestamp: '3 days ago',
    status: 'completed',
  },
  {
    id: 'yacht-mediterranean',
    title: 'Mediterranean Yacht Charter',
    preview: 'Let me show you what I\'ve got for July in the Med...',
    timestamp: '5 days ago',
    status: 'pending',
  },
  {
    id: 'art-basel',
    title: 'Art Basel Miami Access',
    preview: 'VIP passes secured + I set up those private gallery viewings you wanted',
    timestamp: '1 week ago',
    status: 'completed',
  },
];

export function AlfredConversations({ onConversationSelect, onNewConversation }: AlfredConversationsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#60a5fa';
      case 'completed':
        return '#4ade80';
      case 'pending':
        return '#D4AF7A';
      default:
        return '#D4AF7A';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Header */}
      <div
        className="px-6 py-4 backdrop-blur-xl"
        style={{
          background: 'rgba(31,31,31,0.95)',
          borderBottom: '1px solid rgba(212,175,122,0.1)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Alfred Avatar */}
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
              }}
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(212,175,122,0.4)',
                  '0 0 0 8px rgba(212,175,122,0)',
                  '0 0 0 0 rgba(212,175,122,0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <span className="text-[#000000] text-lg">A</span>
            </motion.div>

            <div>
              <h2 className="text-[#F5F5F0]">Alfred</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-xs text-[#F5F5F0]/60">Always available</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Conversation Button */}
        <motion.button
          onClick={onNewConversation}
          className="w-full py-3 rounded-xl relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #B8935E, #D4AF7A, #E6D5B8)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2 relative z-10 text-[#000000]">
            <Plus size={18} />
            <span className="uppercase tracking-wider text-sm">New Conversation</span>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />
        </motion.button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-wider text-[#F5F5F0]/60">
            Recent Conversations
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#F5F5F0]/50">
            <MessageSquare size={12} />
            <span>{mockConversations.length} threads</span>
          </div>
        </div>

        <div className="space-y-3">
          {mockConversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onConversationSelect(conversation.id)}
              className="w-full text-left group"
            >
              <div
                className="p-4 rounded-xl transition-all"
                style={{
                  background: 'rgba(45,45,45,0.6)',
                  border: '1px solid rgba(212,175,122,0.1)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-[#F5F5F0] mb-1 group-hover:text-[#D4AF7A] transition-colors">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#F5F5F0]/50">
                        <Clock size={10} />
                        <span>{conversation.timestamp}</span>
                      </div>
                      {conversation.status && (
                        <>
                          <span className="text-[#F5F5F0]/30">•</span>
                          <span
                            className="text-xs"
                            style={{ color: getStatusColor(conversation.status) }}
                          >
                            {getStatusLabel(conversation.status)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                    style={{ color: '#D4AF7A' }}
                  />
                </div>

                {/* Preview */}
                <p className="text-sm text-[#F5F5F0]/60 line-clamp-2">
                  {conversation.preview}
                </p>

                {/* Status indicator dot */}
                {conversation.status && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#D4AF7A]/10">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: getStatusColor(conversation.status) }}
                    />
                    <span className="text-xs text-[#F5F5F0]/50">
                      {conversation.status === 'active' && 'Awaiting your input'}
                      {conversation.status === 'completed' && 'All tasks completed'}
                      {conversation.status === 'pending' && 'Alfred is working on this'}
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Empty state hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(212,175,122,0.05)',
              border: '1px solid rgba(212,175,122,0.1)',
            }}
          >
            <Sparkles size={14} style={{ color: '#D4AF7A' }} />
            <p className="text-xs text-[#F5F5F0]/60">
              Each conversation is saved and searchable
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
