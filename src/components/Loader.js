export default function Loader({ children, className, text }) {
  return (
    <div className={className}>
      <div className="w-[1.375rem] h-[1.375rem] border-2 border-transparent border-t-black border-b-black rounded-[50%] animate-spin-fast" />
      {children || <div>{text}</div>}
    </div>
  );
}
