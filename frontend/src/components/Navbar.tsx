import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
import { useEthereum } from '../contexts/EthereumContext';

const NavItem:React.FC<{to:string, children: React.ReactNode}> = ({to,children}) => (
  <NavLink
    to={to}
    className={({isActive}) =>
      px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? 'bg-brand/10 text-brand-700' : 'hover:bg-surface-100'
      }
    }
  >
    {children}
  </NavLink>
);

const Navbar:React.FC=()=>{
  const { isAdmin,isIssuer } = useEthereum();
  return(
    <nav className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20 shadow-md ring-1 ring-brand-200/30 border-b border-brand-100/30">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-brand-700 flex items-center gap-2">
          CredChain
        </Link>
        <div className="flex gap-2 md:gap-4">
          <NavItem to="/view" children="View" />
          <NavItem to="/verify" children="Verify" />
          {(isIssuer||isAdmin)&&(
            <>
              <NavItem to="/issue" children="Issue" />
              <NavItem to="/revoke" children="Revoke" />
            </>
          )}
          {isAdmin&&<NavItem to="/universities" children="Universities" />}
        </div>
        <div className="ml-2"><ConnectWallet/></div>
      </div>
    </nav>
  );
};
export default Navbar;