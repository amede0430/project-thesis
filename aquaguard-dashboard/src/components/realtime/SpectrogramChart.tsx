export default function SpectrogramChart() {
  return (
    <div className="bg-dark-quaternary w-full h-80 rounded-sm p-4 relative">
      <img 
        alt="Spectrogramme temps réel montrant les fréquences caractéristiques de fuite" 
        src="https://static.paraflowcontent.com/public/resource/image/c3c9f5ec-5867-43bd-ae68-15ecce2237d6.jpeg" 
        className="w-full h-full object-cover rounded-sm"
      />
      <div className="absolute bottom-2 left-2 text-xs text-white/75">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-1 bg-yellow-500 opacity-50"></div>
          <span>Bande fuite typique (500-1500Hz)</span>
        </div>
      </div>
    </div>
  );
}