import React from 'react';

export default function Footer() {
  return (
    <footer className="fixed left-0 right-0 bottom-0 bg-cifp-red text-white dark:bg-cifp-red-dark z-40">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <p className="text-sm text-center">
          <a
            href="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            Política de privacidad
          </a>
          {'  -  '}
          <a
            href="/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            Copyright 2026
          </a>
          {'  -  '}
          <a
            href="/lovelace"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer"
          >
            Lovelace
          </a>
        </p>
      </div>
    </footer>
  );
}