import React from "react";
import { FieldError} from 'react-hook-form'

export type RegisterInputs = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

export interface IInputForm {
  label: string;
  error?: FieldError;
  children: React.ReactNode
}

const InputGroup: React.SFC<IInputForm> = (props: IInputForm) => {
  const { children, label, error } = props
  const BORDER_COLOR: string = error ? "border-red-500" : "border-gray-500"
  const BORDER_STYLE: string = `mt-1 relative rounded-md shadow-sm border-solid border ${BORDER_COLOR} p-2`

  return (
    <div className="mb-2">
      <div className="inset-y-0 left-0 flex items-center pointer-events-none">
        <span className="text-gray-700 sm:text-sm sm:leading-5">
          {label}
        </span>
      </div>
      <div className={BORDER_STYLE}>
        { children }
      </div>
      {error && <span className="leading-5 text-red-500 text-sm">{error.message}</span>}
    </div>
  )
}

export {InputGroup};
