import React, { useState, useEffect } from 'react';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { Modal, Button, Form, Input, Select, Alert, Space } from 'antd';
import { MdAdd } from 'react-icons/md';
import './ListUsers.css';
import image from '../page/roboticone.png';
import { serviceRobot, serviceUser } from '../services/http-client.service';
import { useLocation, useNavigate } from 'react-router-dom';

const Tableau = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [robotToDelete, setRobotToDelete] = useState(null);
  const [editingRobot, setEditingRobot] = useState(null);
  const [form] = Form.useForm();


  const navigate = useNavigate(); 
  const location = useLocation(); 
  const refirectPath = serviceUser.verifyConnectUser(location.pathname); 
  if ( !refirectPath.state){  navigate(refirectPath.path);}

  useEffect(() => {
    fetchData();
    fetchDataUser();



  }, []);



  const fetchData = async () => {
    try {
      const jsonData = await serviceRobot.selectAll();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlertVisible(true);
    }
  };

  const fetchDataUser = async () => {
    try {
      const jsonData = await serviceUser.selectAll();
      setUsers(jsonData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRobot(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    if (editingRobot) {
      await updateRobot({ ...values, _id: editingRobot._id });
    } else {
      await createRobot(values);
    }
  };

  const handleEdit = (id) => {
    const robotToEdit = data.find((row) => row._id === id);
    if (robotToEdit) {
      setEditingRobot(robotToEdit);
      form.setFieldsValue(robotToEdit);
      setShowModal(true);
    }
  };

  const handleAddClick = () => {
    setEditingRobot(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setRobotToDelete(data.find((row) => row._id === id));
  };

  const createRobot = async (values) => {
    try {
      const response = await serviceRobot.insert(values);
      if (response.ok) {
        fetchData();
        handleModalClose();
      } else {
        throw new Error('Add request failed');
      }
    } catch (error) {
      console.error('Error adding robot:', error);
      setAlertVisible(true);
    }
  };

  const updateRobot = async (values) => {
    try {
      const response = await serviceRobot.update(values);
      if (response.ok) {
        fetchData();
        handleModalClose();
      } else {
        throw new Error('Failed to update robot');
      }
    } catch (error) {
      console.error('Error updating robot:', error);
      setAlertVisible(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await serviceRobot.delete(robotToDelete._id);
      setRobotToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting robot:', error);
      setAlertVisible(true);
    }
  };

  const filteredData = data.filter((row) => {
    // Add your filtering logic here if needed
    return true;
  });

  return (
    <div>
      <h2>Liste des robots</h2>
      {alertVisible && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="Error" type="error" showIcon />
          <Alert message="Error" description="Erreur de récupération des données." type="error" showIcon />
        </Space>
      )}
      {robotToDelete && (
        <>
          <Alert
            message="Êtes-vous sûr de vouloir supprimer le robot ?"
            description={`"${robotToDelete.reference}" ?`}
            type="info"
            showIcon
            closable
            onClose={() => setRobotToDelete(null)}
          />
          <div style={{ marginTop: '16px' }}>
            <Button size="small" style={{ marginRight: '8px' }} onClick={() => setRobotToDelete(null)}>Annuler</Button>
            <Button size="small" danger onClick={confirmDelete}>Supprimer</Button>
          </div>
        </>
      )}

      <Modal title={editingRobot ? "Modifier un robot" : "Ajouter un robot"} visible={showModal} onCancel={handleModalClose} footer={null}>
        <Form form={form} onFinish={handleSubmit} initialValues={editingRobot}>
          <Form.Item label="Reference" name="reference" rules={[{ required: true, message: 'Ce champ est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Utilisateur" name="userId" rules={[{ required: true, message: 'Ce champ est requis' }]}>
            <Select placeholder="Sélectionnez un utilisateur">
              {users.map(user => (
                <Select.Option key={user._id} value={user._id}>
                  {user.nom} {user.prenom} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="ip_robot" name="ip_robot" rules={[{ required: true, message: 'Ce champ est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="nombre_pieces" name="nombre_pieces" rules={[{ required: true, message: 'Ce champ est requis' }]}>
            <Input />
          </Form.Item>
          <div>
            <Button onClick={handleModalClose} style={{ marginRight: 8 }}>Annuler</Button>
            <Button type="primary" htmlType="submit">Valider</Button>
          </div>
        </Form>
      </Modal>

      <button onClick={handleAddClick} className="btn-ajouter">
        <MdAdd className="ajouter" />Ajouter
      </button>

      <div className="Rechercher">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rechercher2"
        />
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="filter"
        >
          <option value="all">Toutes les périodes</option>
          <option value="lastWeek">Semaine dernière</option>
          <option value="lastMonth">Mois dernier</option>
          <option value="lastYear">Année dernière</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr className="bg-gray-200">
            <th className="etable">Image</th>
            <th className="etable">Référence de Robot</th>
            <th className="etable">IP Robot</th>
            <th className="etable">Nombres des pièces</th>
            <th className="etable">Utilisateur</th>
            <th className="etable">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row._id} className="text-center">
              <td className="border px-4 py-2">
                <img src={image} alt="robot" style={{ width: '40px', height: '40px', margin: 'auto' }} />
              </td>
              <td className="border px-4 py-2">{row.reference}</td>
              <td className="border px-4 py-2">{row.ip_robot}</td>
              <td className="border px-4 py-2">{row.nombre_pieces}</td>
              <td className="border px-4 py-2">{row.user ? `${row.user.nom} ${row.user.prenom}` : "vide"}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEdit(row._id)} className="edit">
                  <AiOutlineEdit />
                </button>
                <button onClick={() => handleDelete(row._id)} className="edit">
                  <AiOutlineDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tableau;
