/* eslint-disable @next/next/no-img-element */
export default function Logo() {
    return <div className="h-16 text-center select-none">
        <img src="/logo.png" alt="CloudBreeze" width={75} fetchPriority='high' className='mx-auto' />
    </div>
}
