export default function Loader({ children, className, text }) {
  return (
    <div className={className}>
      <div className="animate-spin-fast h-5.5 w-5.5 rounded-[50%] border-2 border-transparent border-t-black border-b-black" />
      {children || <div>{text}</div>}
    </div>
  );
}
