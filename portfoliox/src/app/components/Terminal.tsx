export default function Terminal() {
    return (
      <div className="h-58 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-[#858585]" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m0 2v12h16V6H4m8 10h6v2h-6v-2z"/>
          </svg>
          <span className="text-xs text-[#858585] font-medium">Terminal</span>
          </div>
          <div className="flex space-x-2">
          <button className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff3b30] transition-colors" 
                  aria-label="Close terminal"/>
          <button className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffa500] transition-colors" 
                  aria-label="Minimize terminal"/>
          <button className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#1d9d2f] transition-colors" 
                  aria-label="Maximize terminal"/>
        </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-grow p-4 font-mono text-sm overflow-y-auto bg-[#1e1e1e]">
          <div className="flex items-center text-[#0d9373]">
            <span className="mr-2">$</span>
            <span className="text-white">npm run view-projects</span>
          </div>
          <div className="mt-2 text-gray-400">Fetching projects...</div>
          <div className="mt-2 text-gray-400">Fount 8 projects...</div>
          
          <div className="mt-4 flex items-center text-[#0d9373]">
            <span className="mr-2">$</span>
            <span className="text-white">git status</span>
          </div>
          <div className="mt-2 text-gray-400">Portfolio v1.0 – Ready to deploy.</div>
        {/* Blinking Cursor */}
        <div className="terminal-line mt-4">
          <span className="text-[#0d9373]">➜</span>
          <span className="ml-2 animate-pulse">_</span>
        </div>
        </div>
      </div>
    );
  }