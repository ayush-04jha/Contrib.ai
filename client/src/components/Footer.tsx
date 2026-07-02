
function Footer() {
    return (
        <div className="flex items-center justify-center bg-[#0d0f14] ">
            <div className="flex  justify-between items-center gap-4 border-t border-[#1a1f2e] min-h-[12vh] min-w-[65%]">
                <div className="text-white flex transition-all duration-300 hover:scale-105 cursor-pointer">
                    <h1>contrib</h1>
                    <h1 className="text-[#a8ff3e]" >.ai</h1>
                </div>
                <div className="text-[#6e7d9b] text-[13px] transition-all duration-300 hover:text-[#a8ff3e] cursor-pointer">Built for developers who want to give back.</div>
            </div>
        </div>

    )
}

export default Footer