interface LogoProps {
    size?: 'large' | 'small';
    className?: string;
}

export default function Logo({ size = 'large', className = '' }: LogoProps) {
    if (size === 'small') {
        return (
            <div className={`font-teko select-none ${className}`}>
                <h1 className="font-bold tracking-wider uppercase leading-none flex gap-1 items-baseline">
                    <span className="text-2xl text-primary">#PANNBEN</span>
                    <span className="text-2xl text-accent">75</span>
                </h1>
            </div>
        );
    }

    return (
        <div className={`font-teko text-white select-none text-center w-full ${className}`}>
            <h1 className="font-bold tracking-wider uppercase leading-none w-full">
                <span className="block text-[18vw] text-primary leading-[0.8]">#PANNBEN</span>
                <span className="block text-[30vw] text-accent leading-[0.8]">75</span>
            </h1>
        </div>
    );
}
