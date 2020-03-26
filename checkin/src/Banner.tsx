import React from "react";
import { ReactSVG } from "react-svg";

import AlertTriangle from './icons/alert-triangle.svg';

export interface IBannerProps {
  shouldDisplay: boolean;
  setShouldDisplay: React.Dispatch<React.SetStateAction<boolean>>
  error: string | undefined;
}

const Banner: React.SFC<IBannerProps> = (props: IBannerProps) => {
  const {error, shouldDisplay, setShouldDisplay} = props;
  const footerClasses = shouldDisplay ? "" : "hidden"
  return (
    <header className={footerClasses}>
      <div className="fixed w-screen top-0 px-0 sm:px-2 sm:pb-6 xl:px-32">
        <div className="flex items-center justify-between sm:rounded-lg shadow-lg px-3 py-3 bg-red-700 sm:mt-2 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="flex flex-column items-center">
            <div className="flex items-center rounded-lg shadow-lg bg-red-900 text-white p-1">
              <ReactSVG src={AlertTriangle} className="text-white" />
            </div>
            <p className="text-gray-200 ml-2 font-medium text-md sm:text-lg">
              {error || "Unexpected error, please contact Kevin"}
            </p>
          </div>
          <button onClick={() => setShouldDisplay(false)} type="button" className="flex items-center justify-center px-2 py-1 leading-6 text-3xl text-white hover:opacity-75 focus:outline-none focus:opacity-50">
            ×
          </button>
        </div>
      </div>
    </header>
  );
}

export { Banner };
