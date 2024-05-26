import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HistoriquePage.css';
import {  serviceHistory, serviceUser } from './services/http-client.service';
import { useLocation, useNavigate } from 'react-router-dom';

const HistoriquePage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [historyData, setHistoryData] = useState([]);


  const navigate = useNavigate(); 
  const location = useLocation(); 
  const refirectPath = serviceUser.verifyConnectUser(location.pathname); 
  if ( !refirectPath.state){  navigate(refirectPath.path);}

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try { 
      const data = await  serviceHistory.selectAll();

      setHistoryData(data);
    } catch (error) {
      console.error('Error fetching history data', error);
    }
  };

  const handlePrint = () => {
    window.print();
    console.log('Printing Statistiques');
  };

  return (
    <div className="history-list">
      <h2>Historique</h2>
      <div className="search-bar">
        <input type="text" placeholder="Rechercher..." />
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Date début"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="Date fin"
        />
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Ref Robot</th>
            <th>Date</th>
            <th>Nombre de pièces totales</th>
            <th>Nombre de pièces palettisées</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map(item => (
            <tr key={item._id}>
              <td className="text-center">{ ( item.robot ? item.robot.reference : "vide")  }</td>
              <td className="text-center">{item.timestamp}</td>
              <td className="text-center">{ ( item.robot ? item.robot.nombre_pieces : "vide")  }</td>
              <td className="text-center">{item.palatizedPieces}</td>
              <td>
                <Button variant="primary" onClick={handlePrint} className="imprimer">
                  Imprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default HistoriquePage;
