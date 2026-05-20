function DragOverlay({ isDragging }) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-[999] bg-black/40 backdrop-blur-md flex items-center justify-center pointer-events-none">
      <div className="px-8 py-6 rounded-3xl border border-white/10 bg-white/10 text-white/80 text-lg font-medium">
        Отпустите изображения
      </div>
    </div>
  );
}

export default DragOverlay;