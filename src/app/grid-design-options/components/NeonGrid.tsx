'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Terminal, Activity, Shield, Cpu, ChevronRight, Hash, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NeonGrid() {
    const [activeTab, setActiveTab] = useState('sys_main')

    const categories = [
        {
            id: 'sys_main',
            label: 'SYS_MAIN',
            title: 'MAINFRAME_WORK',
            icon: <Terminal className="w-4 h-4" />,
            color: 'text-cyan-400 border-cyan-500/50',
            shadow: 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]',
            goals: [
                {
                    id: 1,
                    code: 'G_01',
                    title: 'PROTOCOL_DEEP_WORK',
                    status: 'RUNNING',
                    routines: ['INIT_EMAIL_CHECK', 'EXEC_TEAM_SYNC', 'COMPILE_CODE', 'REF_PLANNING']
                },
                {
                    id: 2,
                    code: 'G_02',
                    title: 'DEPLOY_SEQUENCE',
                    status: 'IDLE',
                    routines: ['STAGING_PUSH', 'DOCS_UPDATE', 'VERIFY_INTEGRITY']
                }
            ]
        },
        {
            id: 'usr_local',
            label: 'USR_LOCAL',
            title: 'PERSONAL_DRIVE',
            icon: <Cpu className="w-4 h-4" />,
            color: 'text-pink-400 border-pink-500/50',
            shadow: 'shadow-[0_0_15px_-3px_rgba(244,114,182,0.3)]',
            goals: [
                {
                    id: 3,
                    code: 'P_01',
                    title: 'BOOT_SEQUENCE',
                    status: 'COMPLETED',
                    routines: ['BREW_COFFEE', 'YOGA_MODULE']
                },
                {
                    id: 4,
                    code: 'P_02',
                    title: 'SLEEP_MODE',
                    status: 'PENDING',
                    routines: ['TERMINATE_SCREENS', 'LOG_JOURNAL']
                }
            ]
        },
        {
            id: 'bio_mon',
            label: 'BIO_MON',
            title: 'BIOMETRICS',
            icon: <Activity className="w-4 h-4" />,
            color: 'text-emerald-400 border-emerald-500/50',
            shadow: 'shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]',
            goals: [
                {
                    id: 5,
                    code: 'H_01',
                    title: 'PHYSICAL_ENHANCE',
                    status: 'WARNING',
                    routines: ['GYM_SESSION_A', 'PROTEIN_INTAKE']
                }
            ]
        }
    ]

    const activeCategory = categories.find(c => c.id === activeTab) || categories[0]

    return (
        <div className="p-8 min-h-screen bg-[#020202] text-zinc-300 font-mono selection:bg-cyan-500/30 selection:text-cyan-100">

            {/* Top Bar / Navigation */}
            <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-sm">
                    <Shield className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs tracking-widest text-zinc-500">SECURE_CONN_ESTABLISHED</span>
                </div>
                <div className="flex-1" />

                <div className="flex gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "px-4 py-2 text-xs border transition-all duration-300 flex items-center gap-2",
                                activeTab === cat.id
                                    ? cn("bg-zinc-900/50", cat.color, cat.shadow)
                                    : "border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
                            )}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Info Panel */}
                <div className="lg:col-span-3 space-y-6">
                    <div className={cn("p-6 border bg-zinc-900/20 backdrop-blur-sm", activeCategory.color)}>
                        <h2 className="text-2xl font-bold tracking-tighter mb-2">{activeCategory.title}</h2>
                        <div className="space-y-2 text-xs opacity-70">
                            <div className="flex justify-between">
                                <span>STATUS:</span>
                                <span className="text-emerald-400">ONLINE</span>
                            </div>
                            <div className="flex justify-between">
                                <span>NODES:</span>
                                <span>{activeCategory.goals.reduce((acc, g) => acc + g.routines.length, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ENCRYPTION:</span>
                                <span>AES-256</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-zinc-800 bg-black">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                            <Activity className="w-4 h-4" />
                            <span>SYSTEM_LOG</span>
                        </div>
                        <div className="space-y-1 text-[10px] font-mono text-zinc-600">
                            <p>&gt; [INFO] Initializing grid view...</p>
                            <p>&gt; [INFO] Loading {activeCategory.id} modules...</p>
                            <p>&gt; [WARN] Caffeine levels low</p>
                            <p className="animate-pulse">&gt; [WAIT] Awaiting user input_</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid Area */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeCategory.goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all duration-300"
                        >
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-zinc-600 group-hover:border-white transition-colors" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-zinc-600 group-hover:border-white transition-colors" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-zinc-600 group-hover:border-white transition-colors" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-zinc-600 group-hover:border-white transition-colors" />

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 border rounded-sm mb-2 inline-block", activeCategory.color)}>{goal.code}</span>
                                        <h3 className="text-lg text-zinc-200 tracking-wide">{goal.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", goal.status === 'RUNNING' ? "bg-emerald-500" : "bg-zinc-600")} />
                                        <span className="text-[10px] text-zinc-500">{goal.status}</span>
                                    </div>
                                </div>

                                {/* Routines List */}
                                <div className="space-y-px">
                                    {goal.routines.map((routine, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer group/item transition-colors">
                                            <span className="text-zinc-600 text-[10px] group-hover/item:text-zinc-400">0{i + 1}</span>
                                            <ChevronRight className="w-3 h-3 text-zinc-700 group-hover/item:text-cyan-400 transition-colors" />
                                            <span className="text-sm text-zinc-400 group-hover/item:text-white transition-colors">{routine}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Line */}
                                <div className="mt-4 pt-4 border-t border-dashed border-zinc-800">
                                    <button className="flex items-center gap-2 text-xs text-zinc-600 hover:text-cyan-400 transition-colors w-full group/btn">
                                        <Command className="w-3 h-3" />
                                        <span>EXECUTE_NEW_ROUTINE</span>
                                        <span className="ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity">_</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty Slot */}
                    <div className="border border-zinc-800 border-dashed bg-transparent p-6 flex flex-col items-center justify-center text-zinc-700 hover:text-zinc-500 hover:border-zinc-700 transition-colors cursor-pointer min-h-[250px] group">
                        <Hash className="w-8 h-8 mb-2 opacity-20 group-hover:opacity-50 transition-opacity" />
                        <span className="text-xs tracking-widest">ALLOCATE_NEW_SECTOR</span>
                    </div>

                </div>
            </div>
        </div>
    )
}
