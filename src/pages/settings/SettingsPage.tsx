import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../libs/api";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateCreateUser } from "../../store/reducers/authReducer";
import config from "../../config";

// Static data for different categories with their progress and capacity
const statisData = [
  {
    name: "Dokumentet",
    percent: 0,
    capacity: "3Gb",
  },
  {
    name: "Video",
    percent: 0,
    capacity: "3Gb",
  },
  {
    name: "Meddelande",
    percent: 0,
    capacity: "3Gb",
  },
  {
    name: "Kalender",
    percent: 0,
    capacity: "3Gb",
  },
];

// Static data for counts of different entities
const statisCountData = [
  {
    name: "Patienter",
    count: 0,
  },
  {
    name: "Gäst / Deltagare",
    count: 0,
  },
];

// Data for AI-related items including title, description, and keywords
const aiData = [
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
  {
    title: "Fråga om huvudverk",
    description: "Jag kan kontakta läkare och han kan hjälpa dig",
    keywords: [
      "Dricka",
      "Krossa",
      "Naked",
      "Violence",
      "Adults",
      "Stress",
      "Voltage",
    ],
  },
];

type Account = {
  user_name: string;
  user_email: string;
  account_description: string;
  old_user_password: string;
  new_user_password: string;
  new_password_confirm: string;
  picture_id: string;
};

const initialAccount: Account = {
  user_name: "",
  user_email: "",
  account_description: "",
  old_user_password: "",
  new_user_password: "",
  new_password_confirm: "",
  picture_id: "",
};

const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const accountMe = useAppSelector((state) => state.auth.createUser);
  const [account, setAccount] = useState<Account>({
    ...initialAccount,
    user_name: accountMe.user_name,
    user_email: accountMe.user_email,
    account_description: accountMe.account_description,
    picture_id: accountMe.picture_id,
  });
  const profileRef = useRef<HTMLInputElement>(null);

  const handleAccountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleProfileInfoSubmit = () => {
    if (!account.user_name || !account.user_email || !account.account_description) {
      return toast.error("Ogiltiga profiluppgifter.");
    }

    apiClient
      .put("/api/users/change-profile-info", {
        user_name: account.user_name,
        user_email: account.user_email,
        account_description: account.account_description,
      })
      .then(() => {
        dispatch(updateCreateUser({ name: "user_name", value: account.user_name }));
        dispatch(updateCreateUser({ name: "user_email", value: account.user_email }));
        dispatch(updateCreateUser({ name: "account_description", value: account.account_description }));
        toast.success("Profilen har uppdaterats.");
      })
      .catch((err) => {
        toast.error("Kunde inte uppdatera profilen. " + (err.response?.data?.error || ""));
      });
  };

  const handlePasswordChangeSubmit = () => {
    if (!account.old_user_password || !account.new_user_password || account.new_user_password !== account.new_password_confirm) {
      return toast.error("Ogiltiga lösenordsuppgifter.");
    }

    apiClient
      .put("/api/users/change-password", {
        old_user_password: account.old_user_password,
        new_user_password: account.new_user_password,
      })
      .then(() => {
        setAccount({
          ...account,
          old_user_password: "",
          new_user_password: "",
          new_password_confirm: "",
        });
        toast.success("Lösenordet har uppdaterats.");
      })
      .catch((err) => {
        toast.error("Kunde inte uppdatera lösenordet. " + (err.response?.data?.error || ""));
      });
  };

  const handleImageSelect = () => {
    if (profileRef.current) {
      profileRef.current.click();
    }
  };

  const handlePictureChange = () => {
    if (profileRef.current && profileRef.current.files && profileRef.current.files[0].type.startsWith("image/")) {
      const formData = new FormData();
      if (profileRef.current.files) formData.append("profile_picture", profileRef.current.files[0]);
      apiClient.put("/api/users/change-profile-picture", formData).then((response: any) => {
        const { message, picture_id } = response;

        if (picture_id) {
          toast.success(message);
          setAccount({ ...account, picture_id });
        }
      });
    } else {
      toast.error("Ladda upp en bildfil.");
    }
  };

  return (
    <motion.div
      className="flex pt-0 gap-4 w-full h-full text-primary-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-2.5 basis-64 overflow-y-auto">
        <div className="bg-white rounded-xl flex-1 flex flex-col gap-2.5 p-4 pb-9">
          <img
            src={`${config.api.resource_uri}/${account.picture_id}`}
            className="rounded-xl aspect-square object-cover"
            alt="Profilbild"
          />
          <Button size="compress" className="font-bold" onClick={handleImageSelect}>
            Byt profil bild
          </Button>
          <input ref={profileRef} type="file" accept="image/*" onChange={handlePictureChange} hidden />
          <div className="pt-4">
            <div className="text-center text-lg font-bold text-primary-background">
              {accountMe.user_name}
            </div>
            <div className="text-center text-disabled-text text-xs">
              {accountMe.user_email}
            </div>
            <div className="text-center text-sm">
              {accountMe.account_description}
            </div>
          </div>
        </div>
        <div className="grow bg-white rounded-xl p-4 pr-1.5 flex flex-col gap-1 overflow-y-auto">
          <p className="text-xl font-bold">Profil statistik</p>
          <p className="text-xs text-disabled-text pt-2 pb-4">
            Listan, åtskilda av kommatecken, alla ord för vilka du kan välja
            rätt svar.
          </p>
          <div className="grow pr-2 flex flex-col gap-y-1 overflow-y-auto">
            <div className="flex flex-col gap-y-1">
              {statisData.map((statisItem, index) => (
                <div key={index} className="flex flex-col gap-y-1">
                  <div className="flex justify-between">
                    <p className="font-bold text-sm leading-4">
                      {statisItem.name}
                    </p>
                    <span className="w-6 h-6 flex items-center justify-center text-disabled-text">
                      <FaChevronRight />
                    </span>
                  </div>
                  <div className="flex items-center gap-x-7">
                    <div className="grow bg-light-background relative rounded-[50px] overflow-hidden h-0.5">
                      <div
                        className="bg-primary-background absolute h-full"
                        style={{ width: `${statisItem.percent}%` }}
                      ></div>
                    </div>
                    <p className="text-disabled-text font-bold text-xs leading-4">
                      {statisItem.capacity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-y-1">
              {statisCountData.map((statisItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-x-2">
                    <p className="font-bold text-sm leading-4">
                      {statisItem.name}
                    </p>
                    <span className="text-disabled-text text-sm leading-4">
                      {statisItem.count}
                    </span>
                  </div>
                  <span className="text-disabled-text">
                    <FaChevronRight />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="p-4 flex flex-col gap-5 bg-white rounded-xl">
          <p className="font-bold leading-4">AI inställningar</p>
          <div className="flex flex-col gap-2 pt-0">
            <div className="font-bold">AI-svars mönster</div>
            <Input
              name="answer"
              placeholder="Skriv ett svar"
              className="border border-primary-border/25 bg-white/30"
            />
            <Input
              name="keyword"
              placeholder="Skriv nyckelord"
              className="border border-primary-border/25 bg-white/30"
            />
          </div>
          <div className="flex">
            <Button size="compress">Lägg till mönster</Button>
          </div>
        </div>
        <div className="grow p-4 pr-1.5 flex flex-col gap-y-0 bg-white rounded-xl overflow-y-auto">
          <div className="grow pr-2 flex flex-col gap-y-2.5 overflow-y-auto scrollbar-none">
            <div className="flex flex-col gap-2.5">
              <div className="font-bold text-xl">Profil inställningar</div>
              <Input name="user_name" value={account.user_name} onChange={handleAccountChange} />
              <Input name="user_email" value={account.user_email} onChange={handleAccountChange} />
              <Input name="account_description" value={account.account_description} onChange={handleAccountChange} />
            </div>
          </div>
          <div className="flex justify-end pt-4 pr-4">
            <Button size="compress" onClick={handleProfileInfoSubmit}>Spara</Button>
          </div>
        </div>
        <div className="grow p-4 pr-1.5 flex flex-col gap-y-0 bg-white rounded-xl overflow-y-auto">
          <div className="grow pr-2 flex flex-col gap-y-2.5 overflow-y-auto scrollbar-none">
            <div className="grow flex flex-col justify-end gap-2.5">
              <p className="font-bold text-xl">Lösenord</p>
              <Input
                name="old_user_password"
                value={account.old_user_password}
                placeholder="Nuvarande lösenord"
                onChange={handleAccountChange}
              />
              <Input
                name="new_user_password"
                value={account.new_user_password}
                placeholder="Nytt lösenord"
                onChange={handleAccountChange}
              />
              <Input
                name="new_password_confirm"
                value={account.new_password_confirm}
                placeholder="Upprepa lösenord"
                onChange={handleAccountChange}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 pr-4">
            <Button size="compress" onClick={handlePasswordChangeSubmit}>Ändra lösenord</Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-[3] bg-white rounded-xl p-4 pr-1.5">
        <p className="font-bold text-base leading-5 pb-4">AI struktur list</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 overflow-y-auto pr-2 w-full">
          {aiData.map((dataItem, index) => (
            <div
              key={index}
              className="relative py-4 px-6 flex flex-col gap-y-4 rounded-lg border border-disabled-text bg-light-background"
            >
              <span className="w-6 h-6 flex items-center justify-center absolute top-2.5 right-2.5 text-focused-background hover:text-primary-background text-xl cursor-pointer">
                <MdClose />
              </span>
              <p className="font-bold leading-5">{dataItem.title}</p>
              <p className="text-sm leading-4">{dataItem.description}</p>
              <p className="font-bold leading-5">Nyckelord:</p>
              <div className="flex flex-wrap gap-1">
                {dataItem.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-sm leading-4 bg-white rounded-[4px] py-1 px-2"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
