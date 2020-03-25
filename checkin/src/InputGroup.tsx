import React from "react";
import { FieldError} from 'react-hook-form'

export type RegisterInputs = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

export interface IInputForm {
  name: string;
  label: string;
  placeholder: string;
  register: (ref: RegisterInputs) => void;
  error?: FieldError;
}

const InputGroup: React.SFC<IInputForm> = (props: IInputForm) => {
  const { label, placeholder, register, name, error } = props
  const BORDER_COLOR: string = error ? "border-red-500" : "border-gray-500"
  const BORDER_STYLE: string = `mt-1 relative rounded-md shadow-sm border-solid border ${BORDER_COLOR} p-2`
  console.log(name, error)

  return (
    <div className="mb-2">
      <div className="inset-y-0 left-0 flex items-center pointer-events-none">
        <span className="text-gray-700 sm:text-sm sm:leading-5">
          {label}
        </span>
      </div>
      <div className={BORDER_STYLE}>
        <input ref={register} name={name} className="form-input block w-full pl-7 pr-12 sm:text-sm sm:leading-5" placeholder={placeholder} />
      </div>
      {error && <span className="leading-5 text-red-500 text-sm">{error.message}</span>}
    </div>
  )
}

export {InputGroup};
