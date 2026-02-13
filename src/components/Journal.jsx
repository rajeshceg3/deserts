import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export const Journal = ({ isOpen, onClose, desert }) => {
  const [activeTab, setActiveTab] = useState('log') // 'log', 'guide', 'stars'
  const prefersReducedMotion = usePrefersReducedMotion()

  const tabs = [
    { id: 'log', label: 'Logbook' },
    { id: 'guide', label: 'Field Guide' },
    { id: 'stars', label: 'Star Chart' },
  ]

  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -1 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotate: 1 }}
            className="bg-[#Fdfbf7] text-[#2c2c2c] w-full max-w-2xl h-[80vh] md:h-auto md:min-h-[600px] rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_0_60px_rgba(139,115,85,0.1)] relative font-serif border border-[#e6e2d8] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black/30 hover:text-black/60 transition-colors z-20 p-2"
              aria-label="Close Journal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Header / Tabs */}
            <div className="flex border-b border-[#e6e2d8] bg-[#f4f1ea] px-6 pt-6">
               {tabs.map((tab) => (
                   <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-black font-bold bg-[#Fdfbf7] rounded-t-lg shadow-[0_-2px_5px_rgba(0,0,0,0.05)] -mb-px border-t border-l border-r border-[#e6e2d8]' : 'text-black/40 hover:text-black/70'}`}
                   >
                       {tab.label}
                       {activeTab === tab.id && (
                           <motion.div
                               layoutId="activeTabIndicator"
                               className="absolute bottom-0 left-0 right-0 h-1 bg-[#Fdfbf7]"
                           />
                       )}
                   </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#Fdfbf7] relative">
               <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply z-0" />

               <div className="relative z-10">
                   <AnimatePresence mode="wait">
                       {activeTab === 'log' && (
                           <motion.div
                               key="log"
                               variants={tabContentVariants}
                               initial="hidden"
                               animate="visible"
                               exit="exit"
                           >
                               <div className="flex justify-between items-baseline mb-6 border-b border-black/10 pb-4">
                                   <h2 className="text-2xl font-bold italic text-black/80">{desert?.name}</h2>
                                   <span className="font-mono text-xs text-black/40 uppercase">Entry #{String(desert?.index || '01').padStart(3, '0')}</span>
                               </div>

                               <p className="text-lg leading-relaxed mb-8 font-medium font-serif first-letter:text-4xl first-letter:float-left first-letter:mr-2 first-letter:font-bold">
                                   {desert?.journalEntry}
                               </p>

                               {desert?.wisdom && (
                                   <div className="my-8 p-8 bg-[#f4f1ea] border border-[#e6e2d8] rounded italic text-center relative mx-4 transform -rotate-1 shadow-sm">
                                       <span className="absolute top-4 left-6 text-5xl text-black/10 font-serif leading-none">“</span>
                                       <p className="text-black/70 font-serif text-xl relative z-10 px-6">
                                           {desert.wisdom}
                                       </p>
                                       <span className="absolute bottom-0 right-6 text-5xl text-black/10 font-serif leading-none">”</span>
                                       <div className="mt-4 pt-4 border-t border-black/5 flex justify-center">
                                            <span className="text-black/30 text-[10px] uppercase tracking-widest font-sans">Ancient Wisdom</span>
                                       </div>
                                   </div>
                               )}

                               <div className="flex items-center gap-4 mt-12 text-black/40">
                                   <div className="h-px flex-1 bg-black/10"></div>
                                   <span className="text-xs font-serif italic">End of Entry</span>
                                   <div className="h-px flex-1 bg-black/10"></div>
                               </div>
                           </motion.div>
                       )}

                       {activeTab === 'guide' && (
                           <motion.div
                               key="guide"
                               variants={tabContentVariants}
                               initial="hidden"
                               animate="visible"
                               exit="exit"
                           >
                               <h2 className="text-xl font-bold mb-6 italic text-black/80 border-b border-black/10 pb-4">Flora & Fauna</h2>

                               <div className="space-y-8">
                                   {/* Flora Section */}
                                   <div>
                                       <h3 className="font-mono text-xs uppercase tracking-widest text-black/40 mb-4 flex items-center gap-2">
                                           <span className="w-1 h-1 rounded-full bg-black/40"></span> Native Flora
                                       </h3>
                                       <div className="grid gap-4">
                                           {(desert?.floraDetails || []).map((plant, i) => (
                                               <div key={i} className="bg-[#f9f7f1] p-4 rounded border border-[#e6e2d8] shadow-sm">
                                                   <h4 className="font-bold text-black/70 text-sm mb-1">{plant.name}</h4>
                                                   <p className="text-black/60 text-sm italic serif">{plant.description}</p>
                                               </div>
                                           ))}
                                       </div>
                                   </div>

                                   {/* Creatures Section */}
                                   <div>
                                       <h3 className="font-mono text-xs uppercase tracking-widest text-black/40 mb-4 flex items-center gap-2">
                                           <span className="w-1 h-1 rounded-full bg-black/40"></span> Native Fauna
                                       </h3>
                                       <div className="grid gap-4">
                                           {(desert?.creatureDetails || []).map((creature, i) => (
                                               <div key={i} className="bg-[#f9f7f1] p-4 rounded border border-[#e6e2d8] shadow-sm">
                                                   <h4 className="font-bold text-black/70 text-sm mb-1">{creature.name}</h4>
                                                   <p className="text-black/60 text-sm italic serif">{creature.description}</p>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           </motion.div>
                       )}

                       {activeTab === 'stars' && (
                           <motion.div
                               key="stars"
                               variants={tabContentVariants}
                               initial="hidden"
                               animate="visible"
                               exit="exit"
                           >
                               <h2 className="text-xl font-bold mb-6 italic text-black/80 border-b border-black/10 pb-4">Celestial Observation</h2>

                               {desert?.constellation ? (
                                   <div className="flex flex-col items-center text-center mt-8">
                                       <div className="w-32 h-32 rounded-full bg-[#1a1a2e] mb-6 flex items-center justify-center relative overflow-hidden shadow-inner ring-4 ring-[#e6e2d8]">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
                                            {/* Simple star representation */}
                                            <div className="text-4xl text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">✨</div>
                                       </div>

                                       <h3 className="text-2xl font-serif font-bold text-black/80 mb-2">{desert.constellation.name}</h3>
                                       <p className="text-black/50 font-mono text-xs uppercase tracking-widest mb-8">Visible during Night Cycle</p>

                                       <div className="bg-[#f4f1ea] p-6 rounded-lg border border-[#e6e2d8] text-left w-full max-w-md shadow-sm">
                                           <p className="text-black/70 text-sm mb-4 leading-relaxed">
                                               <strong className="text-black/90 block mb-1 font-sans text-xs uppercase tracking-wide">Observation Notes:</strong>
                                               {desert.constellation.description}
                                           </p>
                                           {desert.constellation.myth && (
                                               <p className="text-black/70 text-sm italic leading-relaxed border-t border-black/5 pt-4 mt-4">
                                                   <strong className="text-black/90 block mb-1 font-sans text-xs uppercase tracking-wide not-italic">Mythology:</strong>
                                                   "{desert.constellation.myth}"
                                               </p>
                                           )}
                                       </div>
                                   </div>
                               ) : (
                                   <div className="text-center py-20 text-black/40 italic">
                                       The skies here are clouded, hiding their secrets...
                                   </div>
                               )}
                           </motion.div>
                       )}
                   </AnimatePresence>
               </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#e6e2d8] bg-[#f4f1ea] px-8 py-4 flex justify-between items-center text-[10px] text-black/30 font-mono uppercase tracking-widest">
                <span>Property of The Explorer</span>
                <span>Vol. {String(desert?.index || 1).padStart(2,'0')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
