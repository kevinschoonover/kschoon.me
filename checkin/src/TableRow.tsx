import React from "react";

export interface ICheckinEntry {
  name: string;
  reservationCode: string;
  flightInfo: string;
  status: string;
}


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


export { TableRow }
