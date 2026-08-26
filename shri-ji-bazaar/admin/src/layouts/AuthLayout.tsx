interface Props { children: React.ReactNode; }
export const AuthLayout = ({ children }: Props) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    {children}
  </div>
);
