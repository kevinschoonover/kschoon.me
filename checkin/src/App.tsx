import React from 'react';


interface ICheckinEntry {
  name: string;
  reservationCode: string;
  flightInfo: string;
  status: string;
}

const checkins: ICheckinEntry[] = [
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"},
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"},
  {name: "Kevin Schoonover", reservationCode: "AAAAAA", flightInfo: "TPE -> STL", status: "Completed"}
]

const TableRow: React.SFC<ICheckinEntry> = (props: ICheckinEntry) => {
  const {name, reservationCode, flightInfo, status } = props;
  const ROW_CLASSES: string = "px-6 py-4 whitespace-no-wrap"

  return (
    <tr>
      <td className={ROW_CLASSES}>{name}</td>
      <td className={ROW_CLASSES}>{reservationCode}</td>
      <td className={ROW_CLASSES}>{flightInfo}</td>
      <td className={ROW_CLASSES}>{status}</td>
    </tr>
  )
}

const App: React.SFC = () => {
  const allCheckins = checkins.map((value, index) => <TableRow key={index} {...value} />)
  return (
    <div className="App min-h-screen bg-gray-300 overflow-x-auto">
      <div className="pt-16 px-4 sm:px-8 md:px-16 xl:px-64">
        <header className="pb-4">
          <div id="body" className="flex flex-row items-baseline">
            <h1 className="text-5xl font-bold">Flights</h1>
            <button type="button" className="text-lg mx-8 text-indigo-700 hover:text-blue-700">Add Flight +</button>
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
