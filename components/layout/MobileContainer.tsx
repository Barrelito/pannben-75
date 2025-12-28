interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function MobileContainer({
    children,
    className = ""
}: MobileContainerProps) {
    return (
        <div className={`min-h-screen w-full mx-auto max-w-lg ${className}`}>
            {children}
        </div>
    );
}
