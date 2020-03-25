import React, {useState} from 'react';
import { useForm } from 'react-hook-form'
import { useFetch } from "use-http";
import { ReactSVG} from "react-svg";

import Modal from "react-modal";
import {config} from "./config";
import {TableRow, ICheckinEntry } from "./TableRow";
import {InputGroup} from "./InputGroup";

import AlertTriangle from './icons/alert-triangle.svg';


Modal.setAppElement('#root')

interface IBannerProps {
  shouldDisplay: boolean;
  setShouldDisplay: React.Dispatch<React.SetStateAction<boolean>>
}

const Banner: React.SFC<IBannerProps> = (props: IBannerProps) => {
  const {shouldDisplay, setShouldDisplay} = props;
  const footerClasses = shouldDisplay ? "h-28" : "hidden h-28"
  return (
    <footer className={footerClasses}>
      <div className="fixed w-screen top-0 px-2 pb-10 sm:px-0 sm:pb-6">
        <div className="flex items-center justify-between rounded-lg shadow-lg pl-6 pr-4 py-3 bg-red-700 mt-2 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="flex flex-column items-center">
            <div className="flex items-center rounded-lg shadow-lg bg-red-900 text-white p-1">
              <ReactSVG src={AlertTriangle} className="text-white" />
            </div>
            <p className="text-gray-200 ml-2 font-medium text-lg">
              Error: Network Error occurred and we had problems
            </p>
          </div>
          <button onClick={() => setShouldDisplay(false)} type="button" className="flex items-center justify-center px-2 py-1 leading-6 text-3xl text-white hover:opacity-75 focus:outline-none focus:opacity-50">
            ×
          </button>
        </div>
      </div>
    </footer>
  );
}

const checkins: ICheckinEntry[] = [
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"},
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"},
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"}
]

const App: React.SFC = () => {
  const [isBannerDisplayed, setIsBannerDisplayed] = useState<boolean>(true);
  const { API_URI } = config;
  const options = { // accepts all `fetch` options
    data: []        // default for `data` will be an array instead of undefined
  }

  const { loading, error, data } = useFetch(`${API_URI}/checkins`, options, []) // onMount (GET by default)
  const { register, handleSubmit, errors } = useForm()
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const allCheckins = checkins.map((value, index) => <TableRow key={index} {...value} />)

  console.log(loading, error, data);

  const onSubmit = (data: any) => {
    console.log("onSubmit", data);

    if (Object.keys(errors).length === 0) {
      setModalOpen(false)
    }
  }
  console.log("errors", errors)

  return (
    <div className="App min-h-screen bg-gray-300 overflow-x-auto">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center"
        contentLabel="Create Check-in Modal"
      >
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-300 opacity-75" />
        </div>

        <div className="rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <header className="text-lg font-bold mb-4">Create a Flight</header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputGroup error={errors.firstName} name="firstName" label="First Name" placeholder="Kevin" register={register({ required: "First Name is Required"})} />
            <InputGroup error={errors.lastName} name="lastName" label="Last Name" placeholder="Schoonover" register={register({required: "Last Name is Required"})} />
            <InputGroup
              error={errors.reservationCode}
              name="reservationCode"
              label="Reservation Code"
              placeholder="AAAAAA"
              register={
                register(
                  {
                    required: "Reservation Code is required",
                    pattern: {
                      value: /[A-Za-z0-9]{6}/,
                      message: "Invalid Reservation Code structure i.e. AAAAAA"}
                  }
                )
              }
            />
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button type="submit" className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-purple-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-purple-500 focus:outline-none focus:border-purple-700 focus:shadow-outline-purple transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                  Submit
                </button>
              </span>
              <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button onClick={() => setModalOpen(false)} type="button" className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                  Cancel
                </button>
              </span>
            </div>
          </form>
        </div>
      </Modal>
      <div className="pt-16 px-4 sm:px-8 md:px-16 xl:px-64">
        <header className="pb-4">
          <div id="body" className="flex flex-row items-baseline">
            <h1 className="text-5xl font-bold">Flights</h1>
            <button onClick={() => setModalOpen(true)} type="button" className="text-lg mx-8 text-indigo-700 hover:text-blue-700">Add Flight +</button>
          </div>
        </header>
        <table className="table-auto min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reservation Code</th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Flight</th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {allCheckins}
          </tbody>
        </table>
      </div>
      <Banner shouldDisplay={isBannerDisplayed} setShouldDisplay={setIsBannerDisplayed} />
    </div>
  );
}

export default App;
