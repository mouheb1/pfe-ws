import React, { useState, useEffect } from 'react';
import Card from './Dashboard/Card';
import StatistiqueChart from './StatistiqueChart';

import BasicAreaChart from './BasicAreaChart';
import { w3cwebsocket as WebSocket } from 'websocket';
import DatePicker from 'react-datepicker';
import ProfilePage from './ProfilePage';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { serviceGlobal, serviceUser } from '../services/http-client.service';
import { state } from '../states/global.state';
import PieChart from './PieChart';
const Statistiques = () => {

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [options, setOptions] = useState({});


  const navigate = useNavigate();
  const location = useLocation();
  const { reference } = useParams();
  const refirectPath = serviceUser.verifyConnectUser(location.pathname);
  // if (!refirectPath.state) { navigate(refirectPath.path); }

  const [data, setData] = useState({
    history: {
      pieces: 0,
      pallets: 0,
      cobotOperatingTime: 0,
      palletizationTime: 0,
      timeToPickup: 7,
      timeToReturn: 0,
      productionOrder: ""
    },
    user: {

    }
  });

  useEffect(() => {
    let localOptions = {}

    if (reference) {
      setOptions({ reference })
      localOptions = { reference }
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setOptions({ userId: user._id })
      localOptions = { userId: user._id }
    }

    fetchData(localOptions);

    if (state) {
      state.wsClient.addMessageListener(() => handleMessage(localOptions));
      return () => {
        state.wsClient.removeMessageListener(() => handleMessage(localOptions));
      };
    }
  }, [reference]);


  const handleMessage = (dataSTR) => {
    try {
      fetchData(options)

    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  const fetchData = async (options) => {
    try {
      const jsonData = await serviceGlobal.getRobotStats(options);
      if (jsonData) {
        setData(jsonData || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Statistiques</h2>
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

      <div className="row1">
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title=" Pièces totales" value={data.history.totalPieces} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Pièces palettisées" value={data.history.palatizedPieces} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Temps de fonctionnement" value={`${data.history.totalExecutionDuration} sec`} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title=" palette complet" value={`${data.history.completedPallets}`} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Temps de palettisation" value={`${data.history.palatizeExecutionDuration} sec`} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Temps de prise" value={`${data.history.timeToPickup || 7} sec`} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Temps de retour" value={`${data.history.timeToReturn || 3} sec`} />
        </div>
        <div className="col-md-3" style={{ margin: "1%", width: "230px", height: "210px" }}>
          <Card icon="pieces" title="Ordre de Fabrication" value={` OF-1000-10000`} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <StatistiqueChart />
        <BasicAreaChart />

      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
        <PieChart />
        <ProfilePage user={data.user} />
      </div>

    </div>
  );
};

export default Statistiques;