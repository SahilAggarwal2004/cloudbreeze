export default function BarProgress({ percent, className }) {
  return (
    percent >= 0 && (
      <div className={"mx-auto flex w-full max-w-[400px] items-center justify-evenly " + className}>
        <div className="h-1 w-4/5 rounded-full bg-gray-300">
          <div className="h-1 rounded-full bg-green-500" style={{ width: `${percent}%` }} />
        </div>
        {percent}%
      </div>
    )
  );
}
