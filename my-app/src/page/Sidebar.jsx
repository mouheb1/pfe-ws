import React from 'react'
import LogoEnova from '../LogoEnova.jpg';
import { ADMIN_SIDE_BAR_DATA, USER_SIDE_BAR_DATA } from "../Data/Data";
import { UilSignOutAlt } from '@iconscout/react-unicons'
import './Sidebar.css'
import { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { useEffect } from 'react';
import { serviceUser } from '../services/http-client.service';




const Sidebar = ({ user = {} }) => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(-1);

    const [sidebarData, setSideBarData] = useState([])

    const handleLogout = () => {
        serviceUser.clear()
        navigate('/login');
    };
    useEffect(() => {
        console.log('selected', selected);
        if (selected === 0) {
            navigate("/Dashboard");
        }
        else if (selected === 1) {
            navigate("/ListUsers");
        }
        else if (selected === 2) {
            navigate("/ListRobot");
        }
        else if (selected === 3) {
            navigate("/HistoriquePage");
        }
        else if (selected === 4) {
            navigate("/Statistiques");
        }
console.log('user.role', user.role);
        if (user.role === 'Admin') {
            setSideBarData(ADMIN_SIDE_BAR_DATA)
        } else {
            setSideBarData(USER_SIDE_BAR_DATA)
        }

    }, [selected, user]);


    console.log('sidebarData', sidebarData);

    return (
        <div className='Sidebar'>
            <div className='Enova'>
                <img src={LogoEnova} alt="logoEnova" />
            </div>
            <div className='menu'>
                {sidebarData && sidebarData.map((item, index) => {
                    return (
                        <div className={selected === index ? 'menuItem active' : 'menuItem'}
                            key={index}
                            onClick={() => setSelected(index)}

                        >
                            <item.icon />
                            <span>
                                {item.heading}
                            </span>
                        </div>
                    )
                })}
                <div className='menuItem' onClick={handleLogout}>
                    {/* <UilSignOutAlt onClick={handleLogout}> </UilSignOutAlt> */}
                    <UilSignOutAlt />
                    <span>Sign Out</span>
                </div>
            </div>

        </div>
    )
}

export default Sidebar