import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  onChange: (isValid: boolean) => void;
  disabled?: boolean;
}

const Captcha: React.FC<CaptchaProps> = ({ onChange, disabled = false }) => {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Generate a random captcha text
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput("");
    setIsValid(false);
    onChange(false);
  };

  // Validate user input against captcha text
  const validateCaptcha = (input: string) => {
    setUserInput(input);
    const valid = input === captchaText;
    setIsValid(valid);
    onChange(valid);
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div
          className="bg-muted p-2 rounded-md font-mono text-lg tracking-widest select-none"
          style={{
            letterSpacing: "0.5em",
            background: "linear-gradient(45deg, #f0f0f0, #e0e0e0)",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Add some noise to make it harder for bots */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#00000011 1px, transparent 0)",
              backgroundSize: "4px 4px",
              opacity: 0.5,
              zIndex: 0,
            }}
          />
          <span className="relative z-10">{captchaText}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateCaptcha}
          disabled={disabled}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Enter the text above"
        value={userInput}
        onChange={(e) => validateCaptcha(e.target.value)}
        className={isValid ? "border-green-500" : ""}
        disabled={disabled}
      />
    </div>
  );
};

export default Captcha;
