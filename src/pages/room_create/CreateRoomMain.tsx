import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import SignOutButton from "../../components/layout/header/SignOutButton";
import TradeMark from "../../components/user/TradeMark";
import Button from "../../components/common/Button";
import { FaPlus } from "react-icons/fa6";

const CreateRoomMain = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-light-background">
      {/* Sign out button positioned in the top-right corner */}
      <SignOutButton className="absolute top-6 right-8" />
      {/* Avatar positioned at the bottom-left corner */}
      <span className="absolute left-8 bottom-6 w-[72px] h-[72px] rounded-lg bg-white flex items-center justify-center">
        <Avatar uri="/images/avatar.png" />
      </span>
      <div className="flex flex-col gap-y-3.5 items-center">
        {/* TradeMark with large text and primary background color */}
        <TradeMark className="text-[32px] font-extrabold leading-10 !text-primary-background" />
        {/* Button to navigate to the onboarding page */}
        <Button
          data-testid="create-room-start"
          className="h-14 py-4 px-[30px] flex gap-x-2"
          onClick={() => {
            navigate("/room/create/onboarding");
          }}
        >
          <span className="shrink-0 flex items-center justify-center">
            <FaPlus />
          </span>
          <p className="text-lg leading-6">Skapa ett rum</p>
        </Button>
      </div>
    </div>
  );
};

export default CreateRoomMain;
