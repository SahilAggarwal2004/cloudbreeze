export default function BarProgress({ percent, className }) {
  return (
    percent >= 0 && (
      <div className={"w-full flex items-center justify-evenly mx-auto max-w-[400px] " + className}>
        <div className="bg-gray-300 rounded-full h-1 w-4/5">
          <div className="bg-green-500 rounded-full h-1" style={{ width: `${percent}%` }} />
        </div>
        {percent}%
      </div>
    )
  );
}
