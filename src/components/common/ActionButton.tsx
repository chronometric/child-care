import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface ActionButtonProps extends PropsWithChildren {
  // Optional additional CSS classes
  className?: string;
  // Optional click handler function
  onClick?: () => void;
  "data-testid"?: string;
}

/**
 * ActionButton component represents a clickable button with customizable styling.
 *
 * @param {ActionButtonProps} props - Component properties including button styling and functionality.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the button.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {() => void} [props.onClick] - Optional function to handle click events.
 * @returns {JSX.Element} The rendered ActionButton component.
 */
function ActionButton({
  className = "",
  children,
  onClick,
  "data-testid": dataTestId,
}: ActionButtonProps) {
  return (
    <span
      data-testid={dataTestId}
      // Merge default Tailwind styles with any additional classes passed via className prop
      className={twMerge(
        "w-12 h-12 flex items-center justify-center rounded-lg hover:opacity-85 active:opacity-70 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Render the button's content */}
      {children}
    </span>
  );
}

export default ActionButton;
