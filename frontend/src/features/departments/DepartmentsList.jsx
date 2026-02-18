import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  MoreVertical,
  Search,
  ExternalLink,
  Loader2,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import api from '../../app/axios';
import { Button, Input, Modal, Card } from '../../components/Common';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    departmentCode: '',
    description: ''
  });

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/departments');
      console.log('DEPARTMENTS RESPONSE:', res?.data);

      const list =
        res?.data?.data?.departments ||
        res?.data?.data ||
        res?.data ||
        [];

      if (Array.isArray(list)) {
        setDepartments(list);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments');
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        departmentCode: dept.departmentCode || '',
        description: dept.description || ''
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        departmentCode: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      alert('Failed to save department. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Failed to delete department.');
      }
    }
  };

  if (isLoading) return <div className="main container mx-auto">Loading departments...</div>;
  if (error) return <div className="main container mx-auto">Error loading departments</div>;

  return (
    <div className="main container mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage organizational units and budgets</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(departments) && departments.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 flex justify-center items-center h-32 text-gray-500">No departments found.</div>
        )}
        {(Array.isArray(departments) ? departments : []).map((dept) => (
          <div key={dept.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Building2 size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleOpenModal(dept)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(dept.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{dept?.name || '-'}</h3>
              <p className="text-xs font-mono text-gray-500 mb-4 bg-gray-100 inline-block px-2 py-0.5 rounded">
                {dept?.departmentCode || 'NO-CODE'}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {dept?.description || 'No description provided for this department.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 mt-auto">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Employees</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">{dept.employees || 0}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Budget</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{dept.budget || 'N/A'}</p>
              </div>
            </div>

            <Button variant="secondary" size="sm" className="w-full mt-4" icon={ExternalLink}>
              View Details
            </Button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingDept ? 'Save Changes' : 'Create Department'}</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input 
            label="Department Name" 
            required 
            placeholder="e.g. Engineering"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Department Code" 
            required 
            placeholder="e.g. ENG"
            value={formData.departmentCode} 
            onChange={e => setFormData({...formData, departmentCode: e.target.value})}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows="3"
              placeholder="Brief description of department responsibilities..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsList;
