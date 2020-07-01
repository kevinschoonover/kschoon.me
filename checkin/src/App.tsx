import React, {useState} from 'react';
import { useForm } from 'react-hook-form'
import Modal from "react-modal";
import { useAllCheckinsQuery, useCreateCheckinMutation, AllCheckinsDocument, AllCheckinsQuery }  from "./generated/graphql";

import { TableRow, ICheckinEntry } from "./TableRow";

import { InputGroup } from "./InputGroup";
import { Banner } from "./Banner";

// TODO: remove
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root')

interface ICreateCheckin {
  firstName: string;
  lastName: string;
  reservationCode: string;
}


const UNEXPECTED_ERROR_MSG = "Unexpected error occurred, please contact Kevin";

const App: React.SFC = () => {
  const [isBannerDisplayed, setIsBannerDisplayed] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const { data, error: queryError } = useAllCheckinsQuery();
  const [createCheckinMutation, { error: mutationError }] = useCreateCheckinMutation(
    {update: (cache, { data } ) => {
      const checkins: AllCheckinsQuery | null = cache.readQuery({ query: AllCheckinsDocument });
      checkins!.allCheckins.edges = checkins?.allCheckins.edges?.concat({"node": {"__typename": "Checkin", ...data!.createCheckin}, "__typename": "CheckinEdge"})
      cache.writeQuery({
         query: AllCheckinsDocument,
         data: checkins
       });
    }, onError: () => {
      console.log("onError");
      setError(`${UNEXPECTED_ERROR_MSG} with 'MutationError'`);
    }}
  );

  const { register, handleSubmit, errors } = useForm<ICreateCheckin>()
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const checkins: ICheckinEntry[] = data?.allCheckins.edges?.map((value) => {
      const {node} = value!
      return {
        "id": node.id,
        "name": `${node.firstName} ${node.lastName}`,
        "reservationCode": node.reservationCode,
        "flightInfo": "Unknown",
        "status": node.checkinStatus
      }
    }) || []

  checkins.sort((a, b) => b.id - a.id)

  const allCheckins = checkins.map((value) => <TableRow key={value.id} {...value} />)

  if (mutationError || queryError) {
    if (!isBannerDisplayed) {
      setError(UNEXPECTED_ERROR_MSG);
      setIsBannerDisplayed(true);
    }
  }

  const onSubmit = async ({firstName, lastName, reservationCode}: ICreateCheckin) => {
    createCheckinMutation({ variables: { lastName, firstName, reservationCode} });
    setModalOpen(false);
  }

  return (
    <div className="App min-h-screen bg-gray-300 overflow-x-auto">
      <Banner error={error} shouldDisplay={isBannerDisplayed} setShouldDisplay={setIsBannerDisplayed} />
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
      <div className="my-16 px-4 sm:px-8 md:px-16 xl:px-64">
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
    </div>
  );
}

export default App;
