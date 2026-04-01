import { ChangeEvent, KeyboardEvent } from "react";
import { twMerge } from "tailwind-merge";

type InputSize = "large" | "medium" | "small";

interface InputProps {
  // Type of the input element (e.g., text, password, etc.)
  type?: string;
  // Size of the input element, controlling padding and height
  size?: InputSize;
  // Name attribute for the input element
  name: string;
  // Value of the input element
  value?: string;
  // Placeholder text for the input element
  placeholder?: string;
  // Optional additional CSS classes
  className?: string;
  // Function to handle change events
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** E2E / automation */
  dataTestId?: string;
}

/**
 * Input component for rendering text input fields with adjustable size and styling.
 *
 * @param {InputProps} props - Component properties including input type, size, and event handlers.
 * @param {string} [props.type="text"] - The type of the input element.
 * @param {InputSize} [props.size="large"] - Determines the size of the input field.
 * @param {string} props.name - The name attribute for the input field.
 * @param {string} [props.value=""] - The value of the input field.
 * @param {string} [props.placeholder=""] - Placeholder text for the input field.
 * @param {string} [props.className=""] - Additional CSS classes for the input field.
 * @param {(event: ChangeEvent<HTMLInputElement>) => void} [props.onChange=() => {}] - Callback function to handle input changes.
 * @param {(event: KeyboardEvent<HTMLInputElement>) => void} [props.onKeyPress=() => {}] - Callback function to handle input changes.
 * @returns {JSX.Element} The rendered input field.
 */
function Input({
  type = "text",
  size = "large",
  name,
  value = "",
  placeholder = "",
  className = "",
  onChange = () => { },
  onKeyPress = () => { },
  dataTestId,
}: InputProps) {
  // Determines the CSS class for the input size based on the size prop
  const sizeClass =
    size === "large"
      ? "py-[11px] px-5 h-[42px] text-base leading-5"
      : size === "small"
        ? "py-2 px-4 h-[33px] text-xs leading-[18px]"
        : "";

  return (
    <input
      type={type}
      name={name}
      data-testid={dataTestId}
      placeholder={placeholder}
      value={value}
      className={twMerge(
        "font-light placeholder:text-primary-text bg-light-background outline-none rounded-lg",
        sizeClass,
        className
      )}
      onChange={onChange}
      onKeyDown={onKeyPress}
    />
  );
}

export default Input;
