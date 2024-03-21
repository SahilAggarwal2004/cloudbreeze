export default function Loader({ children, className, text }) {
  return (
    <div className={className}>
      <div className="h-[1.375rem] w-[1.375rem] animate-spin-fast rounded-[50%] border-2 border-transparent border-b-black border-t-black" />
      {children || <div>{text}</div>}
    </div>
  );
}
