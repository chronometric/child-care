import { ChangeEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import TradeMark from '../../components/user/TradeMark';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { useAppDispatch } from '../../store';
import { userLogin } from '../../store/reducers/authReducer';
import apiClient from '../../libs/api';
import { setupToken } from '../../libs/token';
import store from '../../store';
import { updateCreateUser } from '../../store/reducers/authReducer'

interface LoginUser {
  email: string;
  password: string;
}

const initialUser: LoginUser = {
  email: '',
  password: ''
};

const Login = () => {
  const navigate = useNavigate(); // useNavigate hook from react-router-dom to programmatically navigate
  const dispatch = useAppDispatch();

  const [loginUser, setLoginUser] = useState<LoginUser>(initialUser);

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginUser({ ...loginUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    apiClient.post('api/users/login', loginUser).then((response: any) => {
      toast.success('Login success.');
      const { token, user_name, user_email, account_description, picture_id } = response;
      dispatch(userLogin());
      setupToken(token);
      if (user_email) {
        store.dispatch(userLogin());
        store.dispatch(updateCreateUser({ name: 'user_name', value: user_name }))
        store.dispatch(updateCreateUser({ name: 'user_email', value: user_email }))
        store.dispatch(updateCreateUser({ name: 'account_description', value: account_description }))
        store.dispatch(updateCreateUser({ name: 'picture_id', value: picture_id }))
      }
      navigate('/'); // Navigates to the home page after successful login
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} // Initial animation state for opacity
      animate={{ opacity: 1 }} // Final animation state for opacity
      // exit={{ opacity: 0 }} // Animation state when the component unmounts
      className="w-full h-full grid grid-cols-2 text-primary-text bg-white rounded-lg overflow-hidden"
    >
      <motion.div
        initial={{ x: 550 }} // Initial animation state for x-axis position
        animate={{ x: 0 }} // Final animation state for x-axis position
        transition={{ duration: 0.6 }} // Duration of the animation
        className="bg-primary-background"
      >
        <div className="py-7 px-8 h-full flex flex-col justify-between">
          <TradeMark className="pb-6 font-extrabold text-xl leading-6" />{' '}
          {/* Branding component for the application */}
          <div className="flex flex-col gap-y-8">
            <p className="font-extrabold text-[32px] leading-10 text-white">
              Välkommen!
            </p>
            <div className="py-4 flex flex-col gap-y-5 text-base leading-5">
              <p className="text-focused-background">
                Denna sida innehåller tre sätt att logga in på.{' '}
                {/* Describes the login options */}
              </p>
              <ul
                style={{ listStyleType: 'square' }}
                className="pl-7 flex flex-col gap-y-4 text-focused-background"
              >
                <li>
                  Skapa ett användarkonto som kan skapa och bjuda in deltagare
                  till rum {/* Option for creating an account */}
                </li>
                <li>
                  Deltar i rummet som ett gäst, observera och kommunicera med
                  användaren {/* Option for guest login */}
                </li>
                <li>
                  Delta som patient eller deltagare.{' '}
                  {/* Option for patient or participant login */}
                </li>
              </ul>
            </div>
          </div>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            className="self-start"
            onClick={() => {
              navigate('/auth/sign-up'); // Navigates to sign-up page
            }}
          >
            Skapa ett konto
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ x: -480 }} // Initial animation state for x-axis position in opposite direction
        animate={{ x: 0 }} // Final animation state for x-axis position
        transition={{ duration: 0.6 }} // Duration of the animation
        className="bg-white"
      >
        <div className="py-4 px-8 h-full">
          <div className="relative h-full flex items-center justify-center">
            <div className="max-w-[250px] w-full flex flex-col gap-y-2">
              <p className="font-extrabold text-2xl">Logga in</p>{' '}
              {/* Login title */}
              <Input
                name="email"
                dataTestId="login-email"
                placeholder="Användarnamn"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30" // Username input field
                value={loginUser.email}
                onChange={handleUserChange}
              />
              <Input
                name="password"
                type="password"
                dataTestId="login-password"
                placeholder="Lösenord"
                className="border border-primary-border/25 text-primary-placeholder bg-white/30" // Password input field
                value={loginUser.password}
                onChange={handleUserChange}
              />
              <Link
                to={''}
                className="text-xs py-1 text-primary-background underline"
              >
                Har du glömd lösenordet? {/* Link for forgotten password */}
              </Link>
              <Button data-testid="login-submit" onClick={handleSubmit}>Logga in</Button>
              <span className="text-primary-text/50 text-xs text-center">
                Or use Bank ID {/* Option for logging in with Bank ID */}
              </span>
              <Button
                variant="outlined"
                className="text-disabled-text"
                onClick={() => {
                  navigate('/auth/signin-with-bank'); // Navigates to Bank ID login page
                }}
              >
                Bank ID
              </Button>
              <span className="text-[10px] text-disabled-text">
                Genom att logga in samtycker jag till Childcare
                Integritetspolicy och tjänstevillkor.{' '}
                {/* User agreement statement */}
              </span>
              <Checkbox
                label="Fortsätt att vara inloggad"
                labelClass="text-xs !text-primary-text/50" // Checkbox for staying logged in
              />
            </div>
            <div className="absolute bottom-2 right-5 flex justify-end gap-x-2">
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigate('/auth/patient-signin'); // Navigates to patient login page
                }}
              >
                Patient
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigate('/auth/guest-signin'); // Navigates to guest login page
                }}
              >
                Gäst
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login; // Exporting the Login component as default
