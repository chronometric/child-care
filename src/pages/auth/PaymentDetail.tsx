import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaChevronDown } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TradeMark from '../../components/user/TradeMark';
import { FEATURES } from '../../config/features';
import { useAppSelector } from '../../store';
import apiClient from '../../libs/api';

const PaymentDetail = () => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const method = searchParams[0].get('method') || 'subscription';

  const createUser = useAppSelector((state) => state.auth.createUser);

  const [option, setOption] = useState<string>('short-pay');

  const handleComplete = () => {
    apiClient.post('api/users/register', createUser).then(() => {
      toast.success('Kontot har skapats.');
      navigate('/room/create');
    });
  };

  if (!FEATURES.commercialAuthFlows) {
    return (
      <div className="w-full h-full text-primary-text bg-white rounded-lg overflow-hidden">
        <div className="py-8 px-8 h-full flex flex-col items-center justify-center gap-4 text-center max-w-lg mx-auto">
          <TradeMark className="font-extrabold text-xl leading-6 !text-primary-background" />
          <p className="font-extrabold text-xl">Betalningsflöde är inte aktiverat</p>
          <p className="text-sm text-disabled-text">
            Aktivera med VITE_ENABLE_COMMERCIAL_FLOWS=true när registrering via betalning ska användas.
          </p>
          <Button onClick={() => navigate('/auth/sign-in')}>Till inloggning</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-primary-text bg-white rounded-lg overflow-hidden">
      <div className="py-4 px-6 h-full flex flex-col">
        <div className="flex justify-between pb-2">
          <TradeMark className="pt-2.5 pl-2.5 font-extrabold text-2xl leading-6 !text-primary-background" />
          <div className="flex flex-col items-end gap-y-2">
            <p className="font-extrabold text-2xl leading-8">
              {method === 'subscription' ? 'Prenumeration' : 'Timpriser'}
            </p>
            <p className="text-[10px] leading-3 text-disabled-text">
              Välj betalningsmetod
            </p>
          </div>
        </div>
        <div className="grow grid grid-cols-8 gap-x-6">
          <div
            className={twMerge(
              'flex flex-col justify-center',
              method === 'subscription' ? 'col-span-5 px-8' : 'col-span-4 px-2'
            )}
          >
            <p className="font-semibold text-base leading-5 pb-4">
              Betalningsmetod
            </p>
            <div className="p-2 flex items-center justify-between border-t border-t-white/30">
              <div
                className="flex items-center gap-x-2 cursor-pointer"
                onClick={() => {
                  setOption('short-pay'); // Set payment option to short-pay
                }}
              >
                <span
                  className={twMerge(
                    'w-5 h-5 rounded-full flex items-center justify-center border border-disabled-text',
                    option === 'short-pay' ? '!border-[7px] !border-black' : ''
                  )}
                />
                <p className="text-sm leading-4 text-primary-placeholder">
                  Kort betalning
                </p>
              </div>
              <img src="/images/auth/klarna.png" alt="Pay icon" />
            </div>
            <div className="py-3 px-5 border border-light-border rounded-[4px]">
              <p className="text-xs leading-4">
                <span className="font-bold">Kort </span>
                VISA - - - - 8324
              </p>
            </div>
            <div className="py-3 px-5 border border-disabled-text rounded-[4px]">
              <p className="text-xs leading-4">
                <span className="font-bold">Använda bank konto </span>- - - -
                123922
              </p>
            </div>
            <div className="pt-2">
              <ul
                style={{
                  listStyle: 'square'
                }}
                className="pl-10 py-4 px-5 flex flex-col font-semibold text-xs leading-6 bg-light-background"
              >
                <li>Pengar tas ut cirka två bankdagar</li>
                <li>Autogirodebitering</li>
                <li>Klarna betalnings säkerhet</li>
              </ul>
            </div>
            <div className="pt-2 pb-4">
              <span className="underline text-primary-background text-xs leading-4">
                Läs mer
              </span>
            </div>
            <div className="p-2 flex items-center justify-between border-t border-t-white/30">
              <div
                className="flex items-center gap-x-2 cursor-pointer"
                onClick={() => {
                  setOption('invoice-pay'); // Set payment option to invoice-pay
                }}
              >
                <span
                  className={twMerge(
                    'w-5 h-5 rounded-full flex items-center justify-center border border-disabled-text',
                    option === 'invoice-pay'
                      ? '!border-[7px] !border-black'
                      : ''
                  )}
                />
                <p className="text-sm leading-4 text-primary-placeholder">
                  Faktura betalning
                </p>
              </div>
              <img src="/images/auth/klarna.png" alt="Pay icon" />
            </div>
            {method === 'hourly' && (
              <div className="pt-2 flex flex-col items-center gap-y-2">
                <p className="text-sm leading-4">Totalsumma inkluderar moms</p>
                <p className="font-bold text-base leading-5">500 SEK</p>
                <Button className="!py-2.5 w-full text-base leading-5 !bg-dark-background !text-light-background !rounded-none">
                  Betala
                </Button>
              </div>
            )}
          </div>
          <div
            className={twMerge(
              'flex flex-col gap-y-1',
              method === 'subscription'
                ? 'col-span-3 px-8 justify-center'
                : 'col-span-4 justify-between'
            )}
          >
            <div className="flex flex-col gap-y-1">
              <p className="text-sm leading-4 text-disabled-text">
                Personnummer
              </p>
              <Input
                name="ssn"
                placeholder="853423-5432"
                className="!bg-white/30 border !border-primary-border/25 rounded-none"
              />
              <Button className="!py-2.5 text-base leading-5 !bg-dark-background !text-light-background !rounded-none">
                Koppla konto
              </Button>
              <div className="p-5 text-primary-placeholder text-base leading-5">
                <p>Johan Anderson</p>
                <p>Ringgatan 40,</p>
                <p>653 49 Karlstad</p>
              </div>
            </div>
            {method === 'hourly' && (
              <div className="py-6 px-2 flex flex-col gap-y-2.5 bg-light-background rounded-lg">
                <p className="font-semibold text-base leading-5">TId</p>
                <div className="py-3 px-2 rounded-[4px] flex items-center justify-between font-bold text-xs leading-4 bg-white">
                  <p>Tidkostnad</p>
                  <p>500kr</p>
                </div>
                <p className="text-sm leading-4">Kvantitet</p>
                <div className="py-4 px-2 flex items-center justify-between border-b border-b-disabled-text">
                  <p className="font-bold text-xs leading-4">1</p>
                  <span className="w-6 h-6 flex items-center justify-center">
                    <FaChevronDown />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-4 pt-1.5">
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              navigate('/auth/payment'); // Navigate back to the payment page
            }}
          >
            Tillbaka
          </Button>
          <Button variant="contained" onClick={handleComplete}>
            Slutför
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
