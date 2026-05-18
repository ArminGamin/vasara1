import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { WbShoppingBagIcon } from './icons/WbShoppingBagIcon';
import type { Location } from 'react-router-dom';

type HashNavProps = {
  hash: string;
  className: string;
  children: React.ReactNode;
  isActive?: boolean;
  pathname: string;
  role?: React.AriaRole;
  onAwayNavigate: () => void;
  onSamePageNavigate: (hash: string) => void;
};

export type ProductsGunNavChoice = 'all' | 'automatas' | 'pistoletas';

function GunsMenuProductLink({
  choice,
  label,
  pathname,
  scrollHash,
  onAwayNavigate,
  onProductsGunNav,
}: {
  choice: ProductsGunNavChoice;
  label: string;
  pathname: string;
  scrollHash: (hash: string) => void;
  onAwayNavigate: () => void;
  onProductsGunNav?: (choice: ProductsGunNavChoice) => void;
}) {
  const cls = 'wb-nav-dropdown-item';
  const roleAttr = 'menuitem' as const;
  if (pathname === '/') {
    return (
      <a
        href="#products"
        className={cls}
        role={roleAttr}
        onClick={(e) => {
          e.preventDefault();
          onProductsGunNav?.(choice);
          scrollHash('#products');
        }}
      >
        {label}
      </a>
    );
  }
  return (
    <Link
      to={{ pathname: '/', hash: 'products', state: { productsGunNav: choice } }}
      className={cls}
      role={roleAttr}
      onClick={() => {
        onAwayNavigate();
      }}
    >
      {label}
    </Link>
  );
}

function HashNav({
  hash,
  className,
  children,
  isActive,
  pathname,
  role,
  onAwayNavigate,
  onSamePageNavigate,
}: HashNavProps) {
  const activeCls = isActive ? ' wb-nav-link-active' : '';
  const cls = `${className}${activeCls}`;
  if (pathname !== '/') {
    return (
      <Link to={`/${hash}`} className={cls} role={role} onClick={onAwayNavigate}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={hash}
      className={cls}
      role={role}
      onClick={(e) => {
        e.preventDefault();
        onSamePageNavigate(hash);
      }}
    >
      {children}
    </a>
  );
}

export type WaterBattleHeaderProps = {
  language: string;
  shopName: string;
  location: Location;
  wishlistCount: number;
  totalItems: number;
  wishlistTitle: string;
  cartTitle: string;
  onWishlistClick: () => void;
  onCartClick: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  announcementText: string;
  onProductsGunNav?: (choice: ProductsGunNavChoice) => void;
};

export function WaterBattleHeader({
  language,
  shopName,
  location,
  wishlistCount,
  totalItems,
  wishlistTitle,
  cartTitle,
  onWishlistClick,
  onCartClick,
  mobileNavOpen,
  setMobileNavOpen,
  announcementText,
  onProductsGunNav,
}: WaterBattleHeaderProps) {
  const lt = language === 'lt';
  const [gunsOpen, setGunsOpen] = useState(false);
  const gunsWrapRef = useRef<HTMLLIElement>(null);

  const closeGuns = useCallback(() => setGunsOpen(false), []);

  useEffect(() => {
    if (!gunsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (gunsWrapRef.current && !gunsWrapRef.current.contains(e.target as Node)) closeGuns();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGuns();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [gunsOpen, closeGuns]);

  const navCopy = lt
    ? {
        home: 'Pagrindinis',
        guns: 'Šautuvai',
        gunsAll: 'Visi produktai',
        gunsAuto: 'Automatas',
        gunsPistol: 'Pistoletas',
        faq: 'DUK',
        reviews: 'Atsiliepimai',
        contact: 'Kontaktai',
        menu: 'Meniu',
      }
    : {
        home: 'Home',
        guns: 'Blasters',
        gunsAll: 'All products',
        gunsAuto: 'Rifle style',
        gunsPistol: 'Pistol style',
        faq: 'FAQ',
        reviews: 'Reviews',
        contact: 'Contact',
        menu: 'Menu',
      };

  const scrollHash = useCallback(
    (hash: string) => {
      const id = hash.replace(/^#/, '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setMobileNavOpen(false);
      closeGuns();
    },
    [closeGuns, setMobileNavOpen]
  );

  const onAwayNavigate = useCallback(() => {
    setMobileNavOpen(false);
    closeGuns();
  }, [closeGuns, setMobileNavOpen]);

  return (
    <div className="wb-nav-shell">
      <div className="wb-nav-topbar wb-ui-font" role="status" aria-live="polite">
        <div className="wb-nav-topbar-inner">
          <span>{announcementText}</span>
        </div>
      </div>

      <div className="wb-nav-bar wb-ui-font">
        <Link to="/" className="wb-nav-logo" aria-label={`${shopName} — ${lt ? 'pradžia' : 'home'}`}>
          <img
            src="/logo-nav-vk.png"
            alt=""
            width={220}
            height={40}
            className="wb-nav-logo-img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </Link>

        <nav className="wb-nav-links wb-heading-font hidden lg:flex" aria-label={lt ? 'Pagrindinė navigacija' : 'Main navigation'}>
          <ul className="wb-nav-links-list">
            <li>
              <NavLink
                className={({ isActive }) =>
                  ['wb-nav-link', isActive ? 'wb-nav-link-active' : ''].filter(Boolean).join(' ')
                }
                to="/"
                end
              >
                {navCopy.home}
              </NavLink>
            </li>
            <li className="wb-nav-has-dropdown" ref={gunsWrapRef}>
              <button
                type="button"
                className={`wb-nav-link wb-nav-dropdown-trigger ${gunsOpen ? 'wb-nav-link-active' : ''}`}
                aria-expanded={gunsOpen}
                aria-haspopup="true"
                aria-controls="wb-nav-guns-menu"
                id="wb-nav-guns-btn"
                onClick={() => setGunsOpen((o) => !o)}
              >
                {navCopy.guns}
                <span className="wb-nav-caret" aria-hidden>
                  ▾
                </span>
              </button>
              {gunsOpen ? (
                <ul id="wb-nav-guns-menu" className="wb-nav-dropdown-panel wb-ui-font" role="menu" aria-labelledby="wb-nav-guns-btn">
                  <li role="none">
                    <GunsMenuProductLink
                      choice="all"
                      label={navCopy.gunsAll}
                      pathname={location.pathname}
                      scrollHash={scrollHash}
                      onAwayNavigate={onAwayNavigate}
                      onProductsGunNav={onProductsGunNav}
                    />
                  </li>
                  <li role="none">
                    <GunsMenuProductLink
                      choice="automatas"
                      label={navCopy.gunsAuto}
                      pathname={location.pathname}
                      scrollHash={scrollHash}
                      onAwayNavigate={onAwayNavigate}
                      onProductsGunNav={onProductsGunNav}
                    />
                  </li>
                  <li role="none">
                    <GunsMenuProductLink
                      choice="pistoletas"
                      label={navCopy.gunsPistol}
                      pathname={location.pathname}
                      scrollHash={scrollHash}
                      onAwayNavigate={onAwayNavigate}
                      onProductsGunNav={onProductsGunNav}
                    />
                  </li>
                </ul>
              ) : null}
            </li>
            <li>
              <HashNav
                hash="#faq"
                className="wb-nav-link"
                isActive={location.pathname === '/' && location.hash === '#faq'}
                pathname={location.pathname}
                onAwayNavigate={onAwayNavigate}
                onSamePageNavigate={scrollHash}
              >
                {navCopy.faq}
              </HashNav>
            </li>
            <li>
              <HashNav
                hash="#reviews"
                className="wb-nav-link"
                isActive={location.pathname === '/' && location.hash === '#reviews'}
                pathname={location.pathname}
                onAwayNavigate={onAwayNavigate}
                onSamePageNavigate={scrollHash}
              >
                {navCopy.reviews}
              </HashNav>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  ['wb-nav-link', isActive ? 'wb-nav-link-active' : ''].filter(Boolean).join(' ')
                }
                to="/kontaktai"
              >
                {navCopy.contact}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="wb-nav-actions">
          <div className="wb-nav-actions-inline">
            <button
              className="wb-nav-icon-btn wb-nav-icon-btn--glow-hover"
              type="button"
              onClick={onWishlistClick}
              title={wishlistTitle}
              aria-label={wishlistTitle}
            >
              <Heart className="wb-nav-icon-svg" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
              {wishlistCount > 0 ? <span className="wb-nav-badge wb-heading-font">{wishlistCount}</span> : null}
            </button>
            <button
              className="wb-nav-icon-btn wb-nav-icon-btn--cart wb-nav-icon-btn--glow-hover"
              type="button"
              onClick={onCartClick}
              title={cartTitle}
              aria-label={cartTitle}
            >
              <WbShoppingBagIcon className="wb-nav-icon-svg" size={23} strokeWidth={2.25} />
              {totalItems > 0 ? <span className="wb-nav-badge wb-heading-font">{totalItems}</span> : null}
            </button>

            <button
              type="button"
              className="wb-nav-icon-btn wb-nav-mobile-menu-trigger lg:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="storefront-mobile-nav"
              aria-haspopup="dialog"
              onClick={() => setMobileNavOpen((o) => !o)}
              title={navCopy.menu}
              aria-label={navCopy.menu}
            >
              {mobileNavOpen ? (
                <X className="wb-nav-icon-svg-lg" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
              ) : (
                <Menu className="wb-nav-icon-svg-lg" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
