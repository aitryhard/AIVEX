function MainShell({
  children,
  setIsDragging,
  setClipboardImages,
}) {
  return (
    <main
      className="w-screen h-screen bg-transparent text-white overflow-hidden"
      onDragOver={(e) => {
        e.preventDefault();

        const hasFiles = Array.from(e.dataTransfer.types).includes("Files");

        if (hasFiles) {
          setIsDragging(true);
        }
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        if (files.length === 0) return;

        files.forEach((file) => {
          if (!file.type.startsWith("image/")) return;

          const reader = new FileReader();

          reader.onload = () => {
            setClipboardImages((prev) => [...prev, reader.result]);
          };

          reader.readAsDataURL(file);
        });
      }}
    >
      {children}
    </main>
  );
}

export default MainShell;