import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import TradeMark from "../../../components/user/TradeMark";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import ProgressBar from "../../../components/common/ProgressBar";
import Toggle from "../../../components/common/Toggle";

// List of keywords for AI limitations
const keywords = [
  "Alkohol",
  "Skrik",
  "Våld",
  "Vuxen",
  "Stress",
  "Misshandel",
  "Slogen",
  "Skola",
  "Vänner",
  "Mobbar",
  "Ensam",
  "Hemma",
];

interface LocationState {
  roomName: string;
  patientName: string;
  patientPersonalID: string;
  avatarName: string;
}

const RoomCreateOnboarding3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = location.state as LocationState;
  console.log("stateParams", stateParams);
  const handleNextClick = () => {
    navigate("/room/create/onboarding/step4", { state: stateParams });
  };

  // State to control whether AI is being used
  const [isUsingAI, setIsUsingAI] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ y: 30, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        bounceDamping: 0.8,
        bounce: 0.2,
        duration: 0.7,
      }}
      className="w-full h-full grid grid-cols-2 rounded-xl border border-disabled-text bg-white overflow-hidden"
    >
      {/* Left side with branding and onboarding instructions */}
      <div className="py-6 px-8 flex-1 flex flex-col gap-y-3 bg-primary-background">
        {/* TradeMark component for branding */}
        <TradeMark className="text-xl leading-6 pb-6" />
        <div className="pb-10 text-[32px] leading-10 text-white font-extrabold">
          <p>2 STEG</p>
          <p>AI-inställningar</p>
        </div>
        <div className="grow flex flex-col gap-5 text-focused-background text-lg leading-6">
          <p>
            Detta registreringssteg är avsett att konfigurera eller begränsa
            användningen av AI i interaktion med din publik.
          </p>
          {/* Instructions for configuring AI settings */}
          <ul
            style={{ listStyleType: "square" }}
            className="pl-6 flex flex-col gap-5"
          >
            <li>
              Var specifik med hur du vill att AI ska interagera med barnen
            </li>
            <li>
              Kom ihåg att AI inte alltid kommer att kunna svara på samma sätt
              som en människa. Därför är det viktigt att skapa svar på de
              viktigaste frågorna.
            </li>
          </ul>
        </div>
      </div>

      {/* Right side with progress bar and AI configuration form */}
      <div className="flex-1 flex flex-col py-4 px-8">
        <div className="py-3.5">
          {/* Progress bar indicating completion of onboarding step */}
          <ProgressBar value={75} />
        </div>
        <div className="pt-4 flex-1 flex flex-col gap-2">
          {/* Toggle switch to enable or disable AI */}
          <div className="flex items-center justify-between">
            <p className="font-bold leading-5">Använd AI</p>
            <Toggle isToggled={isUsingAI} handleToggle={setIsUsingAI} />
          </div>
          {isUsingAI && (
            <div className="grow flex flex-col justify-center gap-y-2">
              {/* AI limitations settings */}
              <div className="pt-2 flex flex-col gap-y-2">
                <p className="font-bold leading-5">AI-begränsningar</p>
                <Input
                  name="keyword"
                  placeholder="Nyckelord"
                  className="border border-primary-border/25 bg-white"
                />
                {/* Display list of keywords */}
                <div className="flex flex-wrap gap-1">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="py-1 px-2 text-xs leading-4 bg-light-background rounded-[4px]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              {/* AI response patterns settings */}
              <div className="pt-2 flex flex-col gap-y-2">
                <p className="font-bold leading-5">AI-svars mönster</p>
                <Input
                  name="answer"
                  placeholder="Skriv ett svar"
                  className="border border-primary-border/25 bg-white"
                />
                <Input
                  name="keyword"
                  placeholder="Skriv nyckelord"
                  className="border border-primary-border/25 bg-white"
                />
              </div>
              <p className="px-2.5 text-xs leading-4 text-disabled-text">
                List, separated by commas, all the words for which you can
                choose the right answer.
              </p>
              <div className="flex items-center justify-between">
                {/* Button to add response patterns */}
                <Button size="small">Lägg till mönster</Button>
                {/* Link to view all AI response patterns */}
                <span
                  className="text-primary-background underline text-sm leading-5 cursor-pointer"
                  onClick={() => {
                    navigate("/ai-structure");
                  }}
                >
                  Se allt
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="pt-1 flex items-center justify-end gap-x-2.5">
          {/* Button to go back to the previous onboarding step */}
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/room/create/onboarding/step2")}
          >
            Tillbaka
          </Button>
          {/* Button to proceed to the next onboarding step */}
          <Button
            size="compress"
            onClick={handleNextClick}
          >
            Nästa
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCreateOnboarding3;
