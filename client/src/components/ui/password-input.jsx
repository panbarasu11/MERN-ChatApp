import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const PasswordInput = React.forwardRef(({ className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <Input
      suffix={
        showPassword ? (
          <EyeIcon onClick={() => setShowPassword(false)} />
        ) : (
          <EyeOffIcon onClick={() => setShowPassword(true)} />
        )
      }
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
