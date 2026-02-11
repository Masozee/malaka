"use client"

import { Conversation } from '@/services/messaging'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PlusSignIcon,
    Comment01Icon
} from '@hugeicons/core-free-icons'

interface MessagesSidebarProps {
    conversations: Conversation[]
    activeConversationId: string | null
    isLoading: boolean
    onSelectConversation: (conversation: Conversation) => void
    onNewChat: () => void
    onNewGroup: () => void
}

export function MessagesSidebar({
    conversations,
    activeConversationId,
    isLoading,
    onSelectConversation,
    onNewChat,
    onNewGroup,
}: MessagesSidebarProps) {
    const directMessages = conversations.filter(c => !c.is_group)
    const groupChats = conversations.filter(c => c.is_group)

    const renderConversationItem = (conv: Conversation) => {
        // Determine display info based on type
        let initial = '?'
        let name = 'Unknown'
        let subtext = ''
        let colorClass = ''

        if (!conv.is_group) {
            const other = conv.other_user
            name = other?.full_name || other?.email || 'Unknown'
            initial = (name[0] || '?').toUpperCase()
            subtext = other?.email || ''
            colorClass = 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
        } else {
            name = conv.name || 'Unnamed Group'
            initial = (name[0] || 'G').toUpperCase()
            subtext = conv.participants ? `${conv.participants.length} members` : ''
            colorClass = 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
        }

        const isActive = conv.id === activeConversationId

        return (
            <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${isActive
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorClass}`}>
                        {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                {name}
                            </p>
                            {conv.unread_count > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 text-[10px] text-white rounded-full flex-shrink-0 ${!conv.is_group ? 'bg-blue-600' : 'bg-purple-600'
                                    }`}>
                                    {conv.unread_count}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                            {subtext}
                        </p>
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
            {isLoading ? (
                <div className="px-3 py-4 text-center text-gray-500 text-xs">Loading...</div>
            ) : conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <HugeiconsIcon icon={Comment01Icon} className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm">No conversations yet</p>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={onNewChat}
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Start Chat
                        </button>
                        <button
                            onClick={onNewGroup}
                            className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                            New Group
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-4">

                    {/* Groups Section */}
                    <div>
                        <div className="px-2 mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Groups
                            </span>
                            <button
                                onClick={onNewGroup}
                                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                title="New Group"
                            >
                                <HugeiconsIcon icon={PlusSignIcon} className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-0.5">
                            {groupChats.length > 0 ? (
                                groupChats.map(renderConversationItem)
                            ) : (
                                <p className="px-2 text-xs text-gray-400 italic py-1">No groups</p>
                            )}
                        </div>
                    </div>

                    {/* Direct Messages Section */}
                    <div>
                        <div className="px-2 mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Direct Messages
                            </span>
                            <button
                                onClick={onNewChat}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="New Direct Message"
                            >
                                <HugeiconsIcon icon={PlusSignIcon} className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-0.5">
                            {directMessages.length > 0 ? (
                                directMessages.map(renderConversationItem)
                            ) : (
                                <p className="px-2 text-xs text-gray-400 italic py-1">No direct messages</p>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
