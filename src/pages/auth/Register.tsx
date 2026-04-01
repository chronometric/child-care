import { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import TradeMark from '../../components/user/TradeMark';
import { FEATURES } from '../../config/features';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateCreateUser } from '../../store/reducers/authReducer';

const Register = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate between routes
  const dispatch = useAppDispatch();
  const createUser = useAppSelector((state) => state.auth.createUser);

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      updateCreateUser({ name: e.target.name as any, value: e.target.value })
    );
  };

  return (
    <div className="w-full h-full grid grid-cols-9 text-primary-text bg-white rounded-lg overflow-hidden">
      <motion.div
        initial={{ x: 480 }} // Initial horizontal position for animation
        animate={{ x: 0 }} // Final horizontal position for animation
        transition={{ duration: 0.6 }} // Duration of the animation
        className="py-4 px-8 col-span-5 bg-white"
      >
        <div className="relative h-full">
          <TradeMark className="absolute top-2.5 left-0 font-extrabold text-xl leading-6 !text-primary-background" />
          <div className="h-full flex items-center justify-center">
            <div className="max-w-[250px] w-full flex flex-col gap-y-2">
              <p className="font-extrabold text-2xl">Skapa ett konto</p>
              <Input
                name="user_email"
                placeholder="E-post"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30"
                value={createUser.user_email}
                onChange={handleUserChange}
              />
              <Input
                name="account_description"
                placeholder="Vård / Företag"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30"
                value={createUser.account_description}
                onChange={handleUserChange}
              />
              <Input
                name="user_name"
                placeholder="Användarnamn"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30"
                value={createUser.user_name}
                onChange={handleUserChange}
              />
              <Input
                name="user_password"
                placeholder="Lösenord"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30"
                value={createUser.user_password}
                onChange={handleUserChange}
              />
              <Button
                className="mt-4"
                onClick={() => {
                  if (FEATURES.commercialAuthFlows) {
                    navigate('/auth/payment');
                  } else {
                    toast('Betalningssteg är avstängt i denna version. Logga in om du redan har ett konto.');
                    navigate('/auth/sign-in');
                  }
                }}
              >
                Skapa
              </Button>
              <span className="text-primary-text/50 text-xs text-center">
                Eller använd BankID
              </span>
              <Button
                variant="outlined"
                className="text-disabled-text"
                onClick={() => {
                  navigate('/auth/signup-with-bank'); // Navigate to signup with Bank ID page
                }}
              >
                Bank ID
              </Button>
              <span className="text-[10px] text-disabled-text">
                Genom att logga in samtycker jag till Childcare
                Integritetspolicy och tjänstevillkor.
              </span>
              <Checkbox
                label="Fortsätt att vara inloggad"
                labelClass="text-xs !text-primary-text/50"
              />
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ x: -550 }} // Initial horizontal position for animation
        animate={{ x: 0 }} // Final horizontal position for animation
        transition={{ duration: 0.6 }} // Duration of the animation
        className="py-7 px-11 col-span-4 bg-primary-background"
      >
        <div className="relative h-full">
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            className="absolute bottom-0 right-0"
            onClick={() => {
              navigate('/auth/sign-in'); // Navigate to sign-in page on button click
            }}
          >
            Tillbaka
          </Button>
          <div className="pr-6 h-full flex flex-col justify-center gap-y-3">
            <p className="font-extrabold text-[32px] leading-10 text-white">
              Välkommen!
            </p>
            <div className="py-4 flex flex-col gap-y-5 text-base leading-5">
              <p className="text-focused-background">
                Denna sida innehåller tre sätt att logga in på.
              </p>
              <ul
                style={{ listStyleType: 'square' }}
                className="pl-7 flex flex-col gap-y-4 text-focused-background"
              >
                <li>
                  Skapa ett användarkonto som kan skapa och bjuda in deltagare
                  till rum
                </li>
                <li>
                  Deltar i rummet som ett gäst, observera och kommunicera med
                  användaren
                </li>
                <li>Delta som patient eller deltagare.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
